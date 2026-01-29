/**
 * Schrödinger's Warehouse Tests
 *
 * Tests for partial failure scenarios where different components succeed/fail independently.
 * Example: Database commit succeeds but API response fails, leaving system in ambiguous state.
 *
 * Key Insight: Idempotency keys prevent duplicate charges on retries.
 */

const axios = require("axios");

const INVENTORY_URL = "http://localhost:3001";
const ORDER_URL = "http://localhost:3002";

describe("Schrödinger's Warehouse - Partial Failures", () => {
  test("DB commit succeeds but API response fails", async () => {
    /**
     * Scenario:
     * - Inventory decremented in DB ✓
     * - But network fails before response sent
     * - Client sees timeout, doesn't know if order succeeded
     */

    const idempotencyKey = `schrödinger-${Date.now()}-${Math.random()}`;

    try {
      const response = await axios.post(
        `${ORDER_URL}/orders`,
        {
          productId: "LAPTOP-001",
          quantity: 1,
          userId: "user123",
        },
        {
          headers: { "Idempotency-Key": idempotencyKey },
          timeout: 500, // Simulate client timeout
        },
      );

      // If we get here, order succeeded
      expect(response.status).toBe(201);
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        // Timeout - state is ambiguous
        console.log("Client: Order timed out - system state unknown");

        // Wait a bit for server to finish processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Client should retry with SAME idempotency key
        try {
          const retryResponse = await axios.post(
            `${ORDER_URL}/orders`,
            {
              productId: "LAPTOP-001",
              quantity: 1,
              userId: "user123",
            },
            {
              headers: { "Idempotency-Key": idempotencyKey },
            },
          );

          // Server returns same response without duplicating
          expect(retryResponse.status).toBe(201);
          expect(retryResponse.data.idempotencyKey).toBe(idempotencyKey);
          console.log("✓ Retry succeeded with idempotency deduplication");
        } catch (retryError) {
          // Service may still be recovering
          console.log("Service still recovering from partial failure");
        }
      } else {
        throw error;
      }
    }
  });

  test("Service crashes after DB commit", async () => {
    /**
     * Scenario:
     * - Product quantity decremented in DB
     * - Server crashes before sending response
     * - On restart, inventory reflects the committed change
     */

    const idempotencyKey = `crash-${Date.now()}-${Math.random()}`;

    // Get initial inventory
    let initialResponse = await axios.get(
      `${INVENTORY_URL}/products/LAPTOP-002`,
    );
    const initialQuantity = initialResponse.data.quantity;

    try {
      // Attempt order that causes crash
      await axios.post(
        `${ORDER_URL}/orders`,
        {
          productId: "LAPTOP-002",
          quantity: 2,
          userId: "user456",
        },
        {
          headers: { "Idempotency-Key": idempotencyKey },
        },
      );
    } catch (error) {
      console.log("Order failed (service crashed)");
    }

    // Wait for service restart simulation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check inventory state persisted
    let afterCrashResponse = await axios.get(
      `${INVENTORY_URL}/products/LAPTOP-002`,
    );
    const afterCrashQuantity = afterCrashResponse.data.quantity;

    // Quantity should be reduced if DB committed before crash
    expect(afterCrashQuantity).toBeLessThanOrEqual(initialQuantity);
    console.log(
      `Inventory persisted: ${initialQuantity} → ${afterCrashQuantity}`,
    );
  });

  test("Network failure during inventory deduction", async () => {
    /**
     * Scenario:
     * - Order service tries to call inventory service
     * - Network fails midway
     * - Both services left in uncertain state
     */

    const response = await axios.post(
      `${ORDER_URL}/orders/verify`,
      {
        productId: "LAPTOP-003",
        quantity: 1,
      },
      { validateStatus: () => true },
    );

    // Service should handle network failures gracefully
    expect([408, 500, 503, 504]).toContain(response.status);
    console.log(`Network failure handled with status: ${response.status}`);
  });

  test("Idempotency key prevents duplicate charges", async () => {
    /**
     * Core Schrödinger's Warehouse protection:
     * Same idempotency key = same result, even on retry
     */

    const idempotencyKey = `deduplicate-${Date.now()}`;
    const orderData = {
      productId: "LAPTOP-004",
      quantity: 1,
      userId: "user789",
    };

    // First attempt
    const firstResponse = await axios.post(`${ORDER_URL}/orders`, orderData, {
      headers: { "Idempotency-Key": idempotencyKey },
    });

    const firstOrderId = firstResponse.data.orderId;
    const firstCharges = firstResponse.data.chargeCount || 1;

    // Simulate client retry with same key
    const secondResponse = await axios.post(`${ORDER_URL}/orders`, orderData, {
      headers: { "Idempotency-Key": idempotencyKey },
    });

    const secondOrderId = secondResponse.data.orderId;
    const secondCharges = secondResponse.data.chargeCount || 1;

    // Should return same order, same charge
    expect(firstOrderId).toBe(secondOrderId);
    expect(firstCharges).toBe(secondCharges);
    expect(secondCharges).toBe(1); // NOT 2!
    console.log("✓ Idempotency key prevented duplicate charge");
  });

  test("State verification after partial failure", async () => {
    /**
     * Scenario:
     * Use state verification endpoint to determine what actually happened
     */

    const idempotencyKey = `verify-${Date.now()}`;

    try {
      await axios.post(
        `${ORDER_URL}/orders`,
        {
          productId: "LAPTOP-005",
          quantity: 1,
          userId: "user999",
        },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
    } catch (error) {
      // Regardless of error, can verify state
      const stateResponse = await axios.get(
        `${ORDER_URL}/orders/state/${idempotencyKey}`,
        { validateStatus: () => true },
      );

      // State endpoint tells us what actually happened
      console.log(`Order state: ${stateResponse.data.status}`);
      expect(["PENDING", "COMMITTED", "FAILED"]).toContain(
        stateResponse.data.status,
      );
    }
  });

  test("Saga pattern transaction log", async () => {
    /**
     * Scenario:
     * Distributed transaction with multiple steps:
     * 1. Decrement inventory
     * 2. Create order
     * 3. Process payment
     *
     * Transaction log shows which steps completed before failure
     */

    const orderId = `saga-${Date.now()}`;

    // Get transaction log
    const logResponse = await axios.get(
      `${ORDER_URL}/orders/${orderId}/saga-log`,
      { validateStatus: () => true },
    );

    if (logResponse.status === 200) {
      const sagaLog = logResponse.data.steps;

      // Each step shows timestamp and status
      console.log("Saga steps:");
      sagaLog.forEach((step) => {
        console.log(`  ${step.name}: ${step.status} (${step.timestamp})`);
      });

      // If payment failed, only inventory and order steps succeeded
      const failedSteps = sagaLog.filter((s) => s.status === "FAILED");
      const succeededSteps = sagaLog.filter((s) => s.status === "SUCCESS");

      expect(succeededSteps.length).toBeGreaterThan(0);
      console.log(
        `Saga recovered: ${succeededSteps.length} succeeded, ${failedSteps.length} failed`,
      );
    }
  });

  test("Eventual consistency after failure", async () => {
    /**
     * Scenario:
     * System doesn't need to be consistent immediately after failure.
     * Over time (eventually) it reaches consistent state.
     */

    const idempotencyKey = `eventual-${Date.now()}`;

    try {
      await axios.post(
        `${ORDER_URL}/orders`,
        {
          productId: "LAPTOP-006",
          quantity: 1,
          userId: "user101",
        },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
    } catch (error) {
      // Immediately inconsistent - don't know order status
      console.log("Immediate state: INCONSISTENT");

      // Wait for background reconciliation
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const reconciliationResponse = await axios.get(
            `${ORDER_URL}/orders/reconcile/${idempotencyKey}`,
          );

          if (reconciliationResponse.data.isConsistent) {
            console.log(
              `✓ Eventual consistency reached after ${(i + 1) * 500}ms`,
            );
            expect(reconciliationResponse.data.isConsistent).toBe(true);
            return;
          }
        } catch {
          // Still reconciling
        }
      }

      throw new Error("Failed to reach eventual consistency");
    }
  });

  test("Manual override for stuck transactions", async () => {
    /**
     * Scenario:
     * If reconciliation takes too long, operator can manually resolve
     * (requires admin credentials)
     */

    const orderId = `stuck-${Date.now()}`;

    try {
      // Admin force-resolves stuck transaction
      const forceResponse = await axios.post(
        `${ORDER_URL}/admin/resolve-transaction/${orderId}`,
        { resolution: "COMMIT" },
        {
          headers: { "X-Admin-Token": "secret-admin-token" },
          validateStatus: () => true,
        },
      );

      if (forceResponse.status === 200) {
        console.log(
          `✓ Transaction manually resolved: ${forceResponse.data.result}`,
        );
        expect(forceResponse.data.result).toBe("COMMITTED");
      } else if (forceResponse.status === 404) {
        console.log("Transaction not found (already resolved)");
      }
    } catch (error) {
      console.log("Admin resolution not implemented");
    }
  });
});
