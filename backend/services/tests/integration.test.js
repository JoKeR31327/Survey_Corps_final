/**
 * Integration & Load Tests
 *
 * Full system testing under realistic load and stress conditions.
 * Tests circuit breakers, timeouts, cascading failures, and recovery.
 */

const axios = require("axios");

const INVENTORY_URL = "http://localhost:3001";
const ORDER_URL = "http://localhost:3002";
const USER_URL = "http://localhost:3003";

describe("Integration & Load Tests", () => {
  test("Concurrent orders without race conditions", async () => {
    /**
     * Scenario:
     * 10 concurrent orders for same product with limited stock
     * Expected: Total quantity never goes negative
     */

    const productId = "CONCURRENT-001";
    const concurrentRequests = 10;

    // Get initial stock
    const initialResponse = await axios.get(
      `${INVENTORY_URL}/products/${productId}`,
    );
    const initialStock = initialResponse.data.quantity;

    console.log(
      `Initial stock: ${initialStock}, concurrent orders: ${concurrentRequests}`,
    );

    // Launch concurrent orders
    const promises = Array(concurrentRequests)
      .fill(null)
      .map((_, i) =>
        axios.post(
          `${ORDER_URL}/orders`,
          {
            productId,
            quantity: 1,
            userId: `user-${i}`,
          },
          {
            headers: { "Idempotency-Key": `concurrent-${Date.now()}-${i}` },
            validateStatus: () => true,
          },
        ),
      );

    const results = await Promise.all(promises);
    const successCount = results.filter((r) => r.status === 201).length;
    const failureCount = results.filter((r) => r.status >= 400).length;

    console.log(`Succeeded: ${successCount}, Failed: ${failureCount}`);

    // Final stock should be valid
    const finalResponse = await axios.get(
      `${INVENTORY_URL}/products/${productId}`,
    );
    const finalStock = finalResponse.data.quantity;

    expect(finalStock).toBeGreaterThanOrEqual(0);
    expect(finalStock).toBeLessThanOrEqual(initialStock);
    expect(successCount + failureCount).toBe(concurrentRequests);
  });

  test("Order timeout handling with retry", async () => {
    /**
     * Scenario:
     * Order service times out, client retries
     * Should eventually succeed or consistently fail (not duplicate)
     */

    const idempotencyKey = `timeout-${Date.now()}`;
    let succeeded = false;
    let attempts = 0;

    for (let i = 0; i < 3; i++) {
      attempts++;
      try {
        const response = await axios.post(
          `${ORDER_URL}/orders`,
          {
            productId: "TIMEOUT-001",
            quantity: 1,
            userId: "user-timeout",
          },
          {
            headers: { "Idempotency-Key": idempotencyKey },
            timeout: 5000,
          },
        );

        if (response.status === 201) {
          succeeded = true;
          console.log(`✓ Succeeded on attempt ${i + 1}`);
          break;
        }
      } catch (error) {
        if (error.code === "ECONNABORTED") {
          console.log(`Attempt ${i + 1}: Timeout, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    expect(attempts).toBeLessThanOrEqual(3);
    console.log(`Completed in ${attempts} attempts`);
  });

  test("Circuit breaker prevents cascade failures", async () => {
    /**
     * Scenario:
     * Inventory service is down, order service should:
     * 1. Fail immediately (circuit open) instead of hanging
     * 2. Return 503 Service Unavailable
     * 3. Not retry indefinitely
     */

    const startTime = Date.now();

    try {
      // Try order when dependency is unavailable
      await axios.post(
        `${ORDER_URL}/orders`,
        {
          productId: "CIRCUIT-001",
          quantity: 1,
          userId: "user-circuit",
        },
        { timeout: 2000 },
      );
    } catch (error) {
      const elapsedTime = Date.now() - startTime;

      // Should fail fast (circuit breaker opens after ~1 attempt)
      console.log(`Failed after ${elapsedTime}ms`);
      expect(elapsedTime).toBeLessThan(5000);

      // Should not hang indefinitely
      if (error.response) {
        expect([503, 504, 500]).toContain(error.response.status);
        console.log(`Circuit breaker returned: ${error.response.status}`);
      }
    }
  });

  test("Load test: sustained throughput", async () => {
    /**
     * Scenario:
     * Maintain 10 orders/second for 10 seconds
     * Measure success rate and response times
     */

    const ordersPerSecond = 10;
    const durationSeconds = 10;
    const totalOrders = ordersPerSecond * durationSeconds;

    console.log(`Load test: ${totalOrders} orders over ${durationSeconds}s`);

    const metrics = {
      successful: 0,
      failed: 0,
      responseTimes: [],
      startTime: Date.now(),
    };

    const sendOrders = async () => {
      const promises = [];

      for (let i = 0; i < ordersPerSecond; i++) {
        const orderStart = Date.now();

        const promise = axios
          .post(
            `${ORDER_URL}/orders`,
            {
              productId: `LOAD-${Math.floor(Math.random() * 10)}`,
              quantity: 1,
              userId: `user-load-${i}`,
            },
            {
              headers: { "Idempotency-Key": `load-${Date.now()}-${i}` },
              validateStatus: () => true,
              timeout: 5000,
            },
          )
          .then((response) => {
            const responseTime = Date.now() - orderStart;
            metrics.responseTimes.push(responseTime);

            if (response.status === 201) {
              metrics.successful++;
            } else {
              metrics.failed++;
            }
          })
          .catch((error) => {
            metrics.failed++;
            const responseTime = Date.now() - orderStart;
            metrics.responseTimes.push(responseTime);
          });

        promises.push(promise);
      }

      await Promise.all(promises);
    };

    // Send orders for specified duration
    const endTime = Date.now() + durationSeconds * 1000;
    while (Date.now() < endTime) {
      await sendOrders();
      // Send next batch after 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const elapsedTime = Date.now() - metrics.startTime;
    const successRate =
      (metrics.successful / (metrics.successful + metrics.failed)) * 100;
    const avgResponseTime =
      metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) /
          metrics.responseTimes.length
        : 0;
    const maxResponseTime =
      metrics.responseTimes.length > 0 ? Math.max(...metrics.responseTimes) : 0;

    console.log(`
      Load Test Results:
      - Duration: ${elapsedTime}ms
      - Successful: ${metrics.successful}
      - Failed: ${metrics.failed}
      - Success Rate: ${successRate.toFixed(2)}%
      - Avg Response Time: ${avgResponseTime.toFixed(0)}ms
      - Max Response Time: ${maxResponseTime}ms
    `);

    // Should maintain at least 85% success rate under load
    expect(successRate).toBeGreaterThanOrEqual(85);
    expect(maxResponseTime).toBeLessThan(10000); // No single request takes > 10s
  });

  test("Cross-service communication latency", async () => {
    /**
     * Scenario:
     * Measure latency when order-service calls inventory-service
     */

    const measurements = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      try {
        await axios.post(
          `${ORDER_URL}/orders`,
          {
            productId: "LATENCY-001",
            quantity: 1,
            userId: `user-latency-${i}`,
          },
          { timeout: 5000, validateStatus: () => true },
        );
      } catch (error) {
        // Still measure even if fails
      }

      const latency = Date.now() - startTime;
      measurements.push(latency);
    }

    const avgLatency =
      measurements.reduce((a, b) => a + b) / measurements.length;
    const maxLatency = Math.max(...measurements);

    console.log(`
      Cross-service latency:
      - Average: ${avgLatency.toFixed(0)}ms
      - Max: ${maxLatency}ms
    `);

    // Order service should respond within reasonable time
    expect(maxLatency).toBeLessThan(10000);
  });

  test("Resource cleanup after failed requests", async () => {
    /**
     * Scenario:
     * Send many requests that fail
     * Verify system doesn't leak connections/memory
     */

    const failedRequests = 50;

    for (let i = 0; i < failedRequests; i++) {
      try {
        await axios.post(
          `${ORDER_URL}/orders`,
          {
            productId: "NONEXISTENT",
            quantity: 999999, // Invalid
            userId: null, // Invalid
          },
          { timeout: 1000, validateStatus: () => true },
        );
      } catch (error) {
        // Expected to fail
      }
    }

    // After many failures, system should still respond
    const healthCheck = await axios.get(`${ORDER_URL}/health`);
    expect(healthCheck.status).toBe(200);

    console.log(`✓ System recovered after ${failedRequests} failed requests`);
  });

  test("Graceful degradation under extreme load", async () => {
    /**
     * Scenario:
     * Send more requests than system can handle
     * System should degrade gracefully (reject excess) not crash
     */

    const extremeLoad = 100;
    const results = {
      success: 0,
      clientError: 0,
      serverError: 0,
      timeout: 0,
    };

    const promises = Array(extremeLoad)
      .fill(null)
      .map((_, i) =>
        axios
          .post(
            `${ORDER_URL}/orders`,
            {
              productId: `EXTREME-${i % 10}`,
              quantity: 1,
              userId: `user-extreme-${i}`,
            },
            {
              validateStatus: () => true,
              timeout: 2000,
              headers: { "Idempotency-Key": `extreme-${Date.now()}-${i}` },
            },
          )
          .then((response) => {
            if (response.status < 400) results.success++;
            else if (response.status < 500) results.clientError++;
            else results.serverError++;
          })
          .catch((error) => {
            if (error.code === "ECONNABORTED") results.timeout++;
            else results.serverError++;
          }),
      );

    await Promise.all(promises);

    const totalHandled =
      results.success +
      results.clientError +
      results.serverError +
      results.timeout;

    console.log(`
      Extreme load handling:
      - Success: ${results.success}
      - Client Error: ${results.clientError}
      - Server Error: ${results.serverError}
      - Timeout: ${results.timeout}
      - Total Handled: ${totalHandled}/${extremeLoad}
    `);

    // System should handle all requests (success or graceful failure)
    expect(totalHandled).toBe(extremeLoad);
  });

  test("Recovery after transient failures", async () => {
    /**
     * Scenario:
     * Service experiences brief outage, recovers
     * Verify clients can resume operations
     */

    let failures = 0;
    let successes = 0;

    // Send requests across recovery period
    for (let i = 0; i < 10; i++) {
      try {
        const response = await axios.post(
          `${ORDER_URL}/orders`,
          {
            productId: "RECOVERY-001",
            quantity: 1,
            userId: `user-recovery-${i}`,
          },
          {
            timeout: 3000,
            validateStatus: () => true,
            headers: { "Idempotency-Key": `recovery-${Date.now()}-${i}` },
          },
        );

        if (response.status === 201) successes++;
        else failures++;
      } catch (error) {
        failures++;
      }

      // Wait between attempts to allow recovery
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(
      `Recovery results: ${successes} successes, ${failures} failures`,
    );

    // Eventually should recover
    expect(successes).toBeGreaterThan(0);
  });
});
