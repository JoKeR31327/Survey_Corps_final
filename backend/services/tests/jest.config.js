/**
 * Jest Configuration for Microservices Tests
 *
 * This config sets up testing for distributed system scenarios:
 * - Latency pattern injection
 * - Partial failure simulation
 * - Health check verification
 * - Load testing
 */

module.exports = {
  testEnvironment: "node",

  // Timeout for tests (some scenarios need longer)
  testTimeout: 30000,

  // Setup file for test dependencies
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Collect coverage from test files
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],

  // Verbose output to see each test
  verbose: true,

  // Match test files
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

/**
 * SERVICE CONFIGURATION
 *
 * Set these environment variables before running tests:
 *
 * INVENTORY_SERVICE_URL=http://localhost:3001
 * ORDER_SERVICE_URL=http://localhost:3002
 * USER_SERVICE_URL=http://localhost:3003
 *
 * LATENCY_PATTERN - Specify latency injection (milliseconds)
 * Example: [0, 500, 2000, 0, 1500]
 *
 * FAIL_RATE - Percentage of requests to fail (0-100)
 * Default: 0
 *
 * TIMEOUT_THRESHOLD - Max ms before request times out
 * Default: 5000
 */

/**
 * LATENCY TESTING CONFIGURATION
 *
 * Deterministic latency patterns simulate real-world conditions:
 *
 * Pattern 1 - Periodic Spikes:
 * [0, 0, 0, 500, 0, 0, 0, 500]
 * Good network, occasional slowness
 *
 * Pattern 2 - Degrading Service:
 * [50, 100, 150, 200, 250, 300, 400, 500]
 * Service degrades over time (cache miss cascade)
 *
 * Pattern 3 - Recovery:
 * [5000, 4000, 3000, 2000, 1000, 500, 100, 50]
 * Service recovering from overload
 *
 * Pattern 4 - Flaky:
 * [100, 50, 5000, 75, 200, 5000, 50, 100]
 * Network intermittently slow
 */

/**
 * HEALTH CHECK TESTING
 *
 * Services should respond to /health with:
 * {
 *   status: 'UP' or 'DOWN',
 *   checks: {
 *     database: 'UP',
 *     redis: 'UP',
 *     downstream_service: 'UP'
 *   },
 *   timestamp: '2024-01-20T12:34:56Z',
 *   uptime: 3600000
 * }
 *
 * When dependency fails, service health transitions to DOWN
 */

/**
 * SCHRÖDINGER'S WAREHOUSE SCENARIOS
 *
 * Test idempotency key handling:
 *
 * Scenario 1 - Duplicate Prevention:
 * POST /orders with key "K1"           → Order created, charge: 1
 * POST /orders with key "K1" (retry)   → Same order returned, charge: still 1
 *
 * Scenario 2 - State Verification:
 * POST /orders fails                    → Unknown if committed
 * GET /orders/state/{idempotency-key}  → Reveals actual state
 *
 * Scenario 3 - Partial Success:
 * DB: inventory decremented ✓
 * API: response fails ✗
 * Client sees: timeout
 * Retry with same key: returns same success response (no duplicate)
 */

/**
 * LOAD TEST PARAMETERS
 *
 * Sustained Throughput Test:
 * - Duration: 10 seconds
 * - Target Rate: 10 requests/second
 * - Total Requests: 100
 * - Success Threshold: >= 85%
 * - Max Response Time: < 10 seconds
 *
 * Concurrent Orders Test:
 * - Product: Limited stock (< 10 units)
 * - Concurrent Orders: 10
 * - Expected: All orders process, final stock >= 0
 *
 * Extreme Load Test:
 * - Requests: 100 simultaneous
 * - Timeout: 2 seconds
 * - Expected: All handled (success or graceful failure)
 *
 * Circuit Breaker Test:
 * - Dependency: Down
 * - Expected Response Time: < 2 seconds (fail fast)
 * - Expected Status: 503 or 504
 */

/**
 * HOW TO RUN TESTS
 *
 * Run all tests:
 * $ npm test
 *
 * Run specific test suite:
 * $ npm test inventory.latency.test.js
 * $ npm test health.test.js
 * $ npm test schroedingers-warehouse.test.js
 * $ npm test integration.test.js
 *
 * Run with coverage:
 * $ npm test -- --coverage
 *
 * Run in watch mode:
 * $ npm test -- --watch
 *
 * Run with specific pattern:
 * $ npm test -- --testNamePattern="idempotency"
 */

/**
 * FAILURE INJECTION
 *
 * To simulate failures, set environment variables:
 *
 * Inject random failures:
 * FAIL_RATE=30 npm test
 * (30% of requests will fail)
 *
 * Inject specific latency:
 * LATENCY_MS=5000 npm test
 * (All requests delayed by 5 seconds)
 *
 * Simulate service down:
 * SERVICE_DOWN=true npm test
 * (Service returns 503)
 */
