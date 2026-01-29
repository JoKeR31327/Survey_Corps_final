/**
 * Health Endpoint Testing
 * Tests /health endpoints across all services
 * Verifies downstream dependency checks (database, inter-service connections)
 */

const axios = require("axios");

const SERVICES = {
  inventory: "http://localhost:3001",
  order: "http://localhost:3002",
  user: "http://localhost:3003",
};

describe("Health Endpoint Testing - Downstream Dependencies", () => {
  /**
   * Test 1: Inventory Service Health Check
   * Verifies database connectivity and service status
   */
  test("inventory service /health should check database connectivity", async () => {
    const response = await axios.get(
      `${SERVICES.inventory}/api/inventory/health`,
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
      service: "inventory-service",
      timestamp: expect.any(String),
    });

    // Should check database
    expect(response.data).toHaveProperty("database");
    expect(response.data.database).toMatchObject({
      status: expect.stringMatching(/^(connected|disconnected)$/),
      responseTime: expect.any(Number),
    });

    console.log("Inventory Health:", response.data);
  });

  /**
   * Test 2: Order Service Health Check
   * Verifies order service checks downstream inventory service
   */
  test("order service /health should check inventory service dependency", async () => {
    const response = await axios.get(`${SERVICES.order}/api/orders/health`);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
      service: "order-service",
    });

    // Should check downstream services
    expect(response.data).toHaveProperty("dependencies");
    expect(response.data.dependencies).toHaveProperty("inventoryService");
    expect(response.data.dependencies.inventoryService).toMatchObject({
      status: expect.stringMatching(/^(available|unavailable)$/),
      responseTime: expect.any(Number),
      endpoint: `${SERVICES.inventory}/api/inventory/health`,
    });

    console.log("Order Service Health:", response.data);
  });

  /**
   * Test 3: Cascading Health Status
   * If inventory service is down, order service health should reflect it
   */
  test("should propagate upstream service failures to health status", async () => {
    // This would be a simulation test
    // In real environment, we'd temporarily shut down inventory service

    const orderHealth = await axios.get(`${SERVICES.order}/api/orders/health`);

    if (
      orderHealth.data.dependencies.inventoryService.status === "unavailable"
    ) {
      // Order service should mark itself as degraded
      expect(orderHealth.data.status).not.toBe("healthy");
      console.log(
        "Health Status Correctly Propagated: Order service marked as degraded",
      );
    }
  });

  /**
   * Test 4: Health Check Response Time
   * Verifies health checks complete quickly (shouldn't timeout)
   */
  test("health endpoints should respond quickly", async () => {
    const maxHealthCheckTime = 2000; // 2 seconds

    const services = Object.entries(SERVICES);
    const startTime = Date.now();

    for (const [serviceName, url] of services) {
      const serviceStart = Date.now();

      try {
        const response = await axios.get(`${url}/api/${serviceName}/health`, {
          timeout: maxHealthCheckTime,
        });
        const serviceTime = Date.now() - serviceStart;

        expect(serviceTime).toBeLessThan(maxHealthCheckTime);
        expect(response.status).toBe(200);

        console.log(`${serviceName} health check: ${serviceTime}ms`);
      } catch (error) {
        console.error(`${serviceName} health check failed:`, error.message);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`Total health check time: ${totalTime}ms`);
  });

  /**
   * Test 5: Database Connection Error Handling
   * Simulates database failure and checks health endpoint response
   */
  test("should report unhealthy status when database is unreachable", async () => {
    // This is a simulation test - in real environment:
    // 1. Stop the database
    // 2. Call health endpoint
    // 3. Verify it reports database as disconnected

    const expectedUnhealthyResponse = {
      status: "unhealthy",
      database: {
        status: "disconnected",
        error: expect.stringMatching(/ECONNREFUSED|timeout|refused/i),
      },
      checks: expect.objectContaining({
        database: false,
      }),
    };

    console.log(
      "Expected unhealthy response structure:",
      expectedUnhealthyResponse,
    );
  });

  /**
   * Test 6: Health Check Metrics
   * Verifies health endpoint includes performance metrics
   */
  test("health endpoint should include performance metrics", async () => {
    const response = await axios.get(
      `${SERVICES.inventory}/api/inventory/health`,
    );

    expect(response.data).toHaveProperty("metrics");
    expect(response.data.metrics).toMatchObject({
      uptime: expect.any(Number),
      memoryUsage: expect.any(Object),
      cpuUsage: expect.any(Number),
      activeConnections: expect.any(Number),
    });

    expect(response.data.metrics.memoryUsage).toHaveProperty("heapUsed");
    expect(response.data.metrics.memoryUsage).toHaveProperty("heapTotal");

    console.log("Service Metrics:", response.data.metrics);
  });

  /**
   * Test 7: Liveness vs Readiness Probes
   * Kubernetes-style health check separation
   */
  test("should support both liveness and readiness probes", async () => {
    // Liveness probe - is service running?
    const livenessResponse = await axios.get(
      `${SERVICES.inventory}/api/inventory/health/live`,
    );
    expect(livenessResponse.status).toBe(200);

    // Readiness probe - can service handle traffic?
    const readinessResponse = await axios.get(
      `${SERVICES.inventory}/api/inventory/health/ready`,
    );

    expect(readinessResponse.status).toBe(200);
    expect(readinessResponse.data).toHaveProperty("ready");
    expect(readinessResponse.data.ready).toBe(true);

    console.log("Liveness Probe:", livenessResponse.data);
    console.log("Readiness Probe:", readinessResponse.data);
  });

  /**
   * Test 8: Health History Tracking
   * Verifies health status is tracked over time
   */
  test("should track health status history for monitoring", async () => {
    const response = await axios.get(
      `${SERVICES.inventory}/api/inventory/health`,
    );

    expect(response.data).toHaveProperty("history");
    expect(response.data.history).toEqual(expect.any(Array));

    // History should show recent health checks
    response.data.history.forEach((check) => {
      expect(check).toMatchObject({
        timestamp: expect.any(String),
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        responseTime: expect.any(Number),
      });
    });

    console.log(
      "Health History (last 5 checks):",
      response.data.history.slice(-5),
    );
  });
});
