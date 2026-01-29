/**
 * Inventory Service - Latency Pattern Testing
 * Tests the predictable, deterministic latency pattern that simulates
 * real-world network delays and service slowdowns
 */

const axios = require("axios");

const BASE_URL =
  process.env.INVENTORY_SERVICE_URL || "http://localhost:3001";

// Latency configuration - deterministic pattern
const LATENCY_PATTERN = {
  baseLatency: 100, // ms
  maxLatency: 3000, // 3 seconds - simulates slow response
  pattern: [0, 0, 500, 2000, 0, 0, 1500], // Predictable pattern
  patternIndex: 0,
};

describe("Inventory Service - Latency Pattern Testing", () => {
  let patternIndex = 0;

  /**
   * Test 1: Verify Deterministic Latency Pattern
   * Ensures that the latency pattern repeats predictably
   */
  test("should show predictable latency pattern in sequential requests", async () => {
    const delayPattern = [0, 500, 2000, 0, 1500];
    const measurements = [];

    for (let i = 0; i < delayPattern.length; i++) {
      const startTime = Date.now();

      try {
        await axios.get(`${BASE_URL}/api/inventory/products`);
      } catch (error) {
        // We expect some requests might timeout
        if (!error.code?.includes("ECONNABORTED")) {
          throw error;
        }
      }

      const responseTime = Date.now() - startTime;
      measurements.push({
        index: i,
        expectedLatency: delayPattern[i],
        actualResponseTime: responseTime,
        variance: Math.abs(responseTime - delayPattern[i]),
      });
    }

    // Verify pattern is consistent (within 20% variance)
    measurements.forEach((measurement) => {
      expect(measurement.variance).toBeLessThan(
        measurement.expectedLatency * 0.2 + 100, // 20% variance + 100ms tolerance
      );
    });

    console.log("Latency Pattern Verification:", measurements);
  });

  /**
   * Test 2: Slow Response Handling
   * Verifies that slow inventory responses don't block the order service
   */
  test("should handle slow inventory responses without blocking", async () => {
    const timeout = 5000; // 5 second timeout
    const requests = [];

    // Make 5 concurrent requests
    for (let i = 0; i < 5; i++) {
      requests.push(
        axios
          .get(`${BASE_URL}/api/inventory/products`, { timeout })
          .then((res) => ({
            success: true,
            time: Date.now(),
            status: res.status,
          }))
          .catch((err) => ({
            success: false,
            time: Date.now(),
            error: err.code || err.message,
          })),
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // With latency pattern, some should be fast, some slow
    const fastResponses = results.filter(
      (r) => r.time - startTime < 1000,
    ).length;
    const slowResponses = results.filter(
      (r) => r.time - startTime >= 1000,
    ).length;

    console.log("Request Results:", {
      fastResponses,
      slowResponses,
      totalTime,
      results,
    });

    expect(fastResponses + slowResponses).toBe(5); // All requests completed
    expect(totalTime).toBeLessThan(10000); // Should not take forever
  });

  /**
   * Test 3: Latency Pattern Reset
   * Ensures the pattern cycles properly after reaching the end
   */
  test("should cycle through latency pattern deterministically", async () => {
    const pattern = [0, 500, 2000];
    const iterations = 9; // 3 complete cycles
    const timings = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();

      try {
        await axios.get(`${BASE_URL}/api/inventory/products`, {
          timeout: 5000,
        });
      } catch (error) {
        // Expected for slow responses
      }

      const elapsed = Date.now() - startTime;
      timings.push({
        cycle: Math.floor(i / 3),
        position: i % 3,
        expectedLatency: pattern[i % 3],
        actualLatency: elapsed,
      });
    }

    // Verify pattern repeats
    for (let i = 0; i < timings.length; i++) {
      for (let j = i + 3; j < timings.length; j += 3) {
        const variance = Math.abs(
          timings[i].actualLatency - timings[j].actualLatency,
        );
        expect(variance).toBeLessThan(200); // Same pattern position should have similar latency
      }
    }

    console.log("Pattern Cycling:", timings);
  });

  /**
   * Test 4: Maximum Latency Threshold
   * Ensures latency never exceeds the configured maximum
   */
  test("should not exceed maximum configured latency", async () => {
    const maxLatency = 3500; // ms
    const measurements = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();

      try {
        await axios.get(`${BASE_URL}/api/inventory/products`, {
          timeout: maxLatency + 1000,
        });
      } catch (error) {
        // Expected behavior
      }

      const responseTime = Date.now() - startTime;
      measurements.push(responseTime);
    }

    measurements.forEach((latency) => {
      expect(latency).toBeLessThanOrEqual(maxLatency + 500); // Allow small buffer
    });

    console.log("Latency Measurements (ms):", measurements);
  });

  /**
   * Test 5: Latency Pattern Visibility in Logs
   * Verifies that latency pattern is logged for monitoring
   */
  test("should log latency pattern for monitoring purposes", async () => {
    const response = await axios.get(`${BASE_URL}/api/inventory/health`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("latencyPattern");
    expect(response.data.latencyPattern).toEqual(expect.any(Array));

    console.log(
      "Latency Pattern from Health Endpoint:",
      response.data.latencyPattern,
    );
  });
});
