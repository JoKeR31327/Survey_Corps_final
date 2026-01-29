# Test Guide for Survey Corps Microservices

## Overview

This guide explains the comprehensive test suite for the Survey Corps e-commerce platform with emphasis on testing distributed system reliability, partial failures, and deterministic latency patterns.

---

## Test Files

### 1. **inventory.latency.test.js**

Tests predictable, deterministic latency patterns in the inventory service.

**Key Concept:**
Latency isn't random chaos—it follows patterns we can predict and test.

**What It Tests:**

- ✅ Latency pattern verification (e.g., [0ms, 500ms, 2000ms, ...])
- ✅ Pattern cycling and repetition
- ✅ Variance tolerance (20% acceptable variance)
- ✅ Maximum latency thresholds
- ✅ Latency doesn't exceed circuit breaker timeout

**Example Patterns:**

```javascript
// Pattern: Periodic spikes
[0, 0, 0, 500, 0, 0, 0, 500, ...]

// Pattern: Degrading service
[50, 100, 150, 200, 250, 300, ...]

// Pattern: Service recovering
[5000, 4000, 3000, 2000, 1000, 500, ...]
```

**Why This Matters:**
Production latency isn't uniform. Sometimes responses are fast, sometimes slow. Tests verify the service behaves predictably under these known patterns, helping teams build appropriate timeouts and retry logic.

**Running:**

```bash
npm test inventory.latency.test.js
# or
npm run test:latency
```

---

### 2. **health.test.js**

Tests /health endpoints with downstream dependency checks.

**Key Concept:**
A service is only as healthy as its dependencies. Health endpoints must check databases, caches, and downstream services.

**What It Tests:**

- ✅ Liveness probe (is service running?)
- ✅ Readiness probe (can it handle requests?)
- ✅ Database connectivity
- ✅ Downstream service availability
- ✅ Health status cascades when dependencies fail
- ✅ Response time for health checks (should be < 100ms)

**Expected Health Response:**

```json
{
  "status": "UP",
  "checks": {
    "database": "UP",
    "redis": "UP",
    "inventory_service": "UP"
  },
  "timestamp": "2024-01-20T12:34:56Z",
  "uptime": 3600000
}
```

**When Dependency Fails:**

```json
{
  "status": "DOWN",
  "checks": {
    "database": "DOWN",
    "redis": "UP",
    "inventory_service": "UP"
  },
  "failedDependency": "database"
}
```

**Why This Matters:**
Kubernetes uses health endpoints to decide if pod should be restarted. Service mesh uses them for circuit breaking. Monitoring systems use them for alerting. Incorrect health checks cause cascading failures.

**Running:**

```bash
npm test health.test.js
# or
npm run test:health
```

---

### 3. **schroedingers-warehouse.test.js**

Tests partial failure scenarios where different components succeed/fail independently.

**Key Concept:**
"Schrödinger's Warehouse" = When database commits but response fails, is the order confirmed or not? The state is ambiguous until you check again.

**Problem Scenario:**

```
Order Request
    ↓
Inventory Service: Decrement quantity ✓ (committed to DB)
    ↓
Network Failure ✗ (response never reaches client)
    ↓
Client sees: TIMEOUT
Client thinks: "Did the order go through?"
```

**Solution: Idempotency Keys**

```javascript
// First attempt
POST /orders
Headers: { 'Idempotency-Key': 'unique-key-123' }
Body: { productId: 'LAPTOP', quantity: 1 }
Response: 201 Created, orderId: 'ORD-456'

// Network fails, client retries
POST /orders
Headers: { 'Idempotency-Key': 'unique-key-123' }  // SAME key
Body: { productId: 'LAPTOP', quantity: 1 }
Response: 201 Created, orderId: 'ORD-456'  // SAME order (not duplicated!)
```

**What It Tests:**

- ✅ Idempotency prevents duplicate charges on retry
- ✅ State verification endpoints reveal actual outcome
- ✅ Database commits persist across failures
- ✅ Saga pattern transaction logs show which steps succeeded
- ✅ Eventual consistency after failures
- ✅ Manual override for stuck transactions

**Critical Test: Idempotency Deduplication**

```javascript
// WRONG: Every retry increments charge count
Charge Count: 1, 1, 1  // Should be constant, not incrementing

// CORRECT: Same idempotency key = same result
Charge Count: 1, 1, 1  // ✓ Correct
```

**Why This Matters:**
Without idempotency keys, network retries could charge customers multiple times or decrement inventory twice. This is why payment processors, banks, and e-commerce systems require idempotency keys.

**Manual Testing Schrödinger's Scenario:**

```bash
# Terminal 1: Start services
npm run dev

# Terminal 2: Send order
curl -X POST http://localhost:3002/orders \
  -H "Idempotency-Key: test-123" \
  -H "Content-Type: application/json" \
  -d '{"productId":"LAPTOP-001","quantity":1,"userId":"user1"}' \
  --max-time 0.5

# Likely times out ^

# Terminal 3: Check what actually happened
curl http://localhost:3002/orders/state/test-123
# Returns: { status: 'COMMITTED', orderId: 'ORD-999', ... }

# Terminal 2: Retry with SAME idempotency key
curl -X POST http://localhost:3002/orders \
  -H "Idempotency-Key: test-123" \
  -H "Content-Type: application/json" \
  -d '{"productId":"LAPTOP-001","quantity":1,"userId":"user1"}'

# Returns: { status: 201, orderId: 'ORD-999', ... }
# SAME order ID = no duplicate!
```

**Running:**

```bash
npm test schroedingers-warehouse.test.js
# or
npm run test:schrodinger
```

---

### 4. **integration.test.js**

Full system testing under realistic load and stress conditions.

**What It Tests:**

- ✅ Concurrent orders (10 orders simultaneously)
- ✅ Race condition prevention (stock never goes negative)
- ✅ Timeout handling and retry logic
- ✅ Circuit breaker (fail fast when dependency down)
- ✅ Sustained load (10 requests/sec for 10 seconds, ≥85% success)
- ✅ Cross-service latency measurement
- ✅ Resource cleanup (no connection leaks)
- ✅ Graceful degradation under extreme load (100+ concurrent)
- ✅ Recovery after transient failures

**Load Test Metrics:**

```
Duration: 10 seconds
Target Rate: 10 orders/second
Total Requests: 100

Expected Results:
- Success Rate: ≥ 85%
- Average Response Time: < 1000ms
- Max Response Time: < 10000ms
- No hanging requests
```

**Extreme Load Test:**

```
Concurrent Requests: 100
Expected Behavior:
- All 100 handled (either success or graceful failure)
- No server crashes
- No hung connections
- Graceful rejection if overloaded (status 429 or 503)
```

**Circuit Breaker Test:**

```
Scenario: Inventory service is down

Expected:
Order Service should:
1. Detect failure quickly (< 2 seconds)
2. Open circuit breaker
3. Reject further requests immediately (fail fast)
4. Return 503 Service Unavailable
5. NOT try indefinitely
```

**Running:**

```bash
npm test integration.test.js
# or
npm run test:integration

# Or just stress test
npm run test:stress
```

---

## How to Run All Tests

### Quick Start

```bash
# Install dependencies (if not done)
npm install

# Run all tests
npm test

# Or use the alias
npm run test:all
```

### Run Specific Test Suite

```bash
npm run test:latency      # Latency pattern tests
npm run test:health       # Health endpoint tests
npm run test:schrodinger  # Partial failure tests
npm run test:integration  # Integration & load tests
npm run test:stress       # Stress & extreme load tests
```

### Run with Options

```bash
# Verbose output
npm test -- --verbose

# Stop on first failure
npm test -- --bail

# Run only specific test
npm test -- --testNamePattern="idempotency"

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## Service Configuration

**Required Services Running:**

```bash
# Terminal 1: Inventory Service (port 3001)
cd backend/services/inventory-service
npm run dev

# Terminal 2: Order Service (port 3002)
cd backend/services/order-service
npm run dev

# Terminal 3: User Service (port 3003)
cd backend/services/user-service
npm run dev

# Terminal 4: Run Tests
cd backend/services
npm test
```

**Environment Variables:**

```bash
# Service URLs (adjust if running on different ports)
INVENTORY_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3003

# Latency pattern (array of milliseconds)
LATENCY_PATTERN=[0,500,2000,0,1500]

# Failure injection rate (0-100%)
FAIL_RATE=0

# Request timeout threshold (milliseconds)
TIMEOUT_THRESHOLD=5000
```

---

## Understanding Test Failures

### Test Fails: "Latency variance exceeds 20%"

**Meaning:** Response time varied too much from expected pattern

**Likely Cause:**

- System under unexpected load
- Network congestion
- Service CPU throttled

**Fix:**

- Run tests when system is idle
- Increase variance tolerance if needed
- Check system load: `top` or `Activity Monitor`

### Test Fails: "Health check timeout"

**Meaning:** /health endpoint took too long to respond

**Likely Cause:**

- Database query slow
- Downstream service unavailable
- Network latency

**Fix:**

```bash
# Check if database is running
ps aux | grep postgres

# Check if services are running
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Check network
ping google.com
```

### Test Fails: "Idempotency key deduplication failed"

**Meaning:** Same idempotency key returned different results

**Likely Cause:**

- Service doesn't implement idempotency
- Database storing idempotency keys not working
- Request de-duplication cache expired

**Fix:**

- Verify service implements idempotency key handling
- Check request body exactly matches (including order of fields)
- Ensure idempotency cache ttl is > 24 hours

### Test Fails: "Success rate below 85%"

**Meaning:** Under load, too many requests failed

**Likely Cause:**

- Service timeout too short
- Service not scaled enough
- Database connections exhausted

**Fix:**

- Increase timeout threshold
- Add database connection pooling
- Scale service horizontally (run multiple instances)
- Check database logs for errors

### Test Fails: "Stock went negative"

**Meaning:** Race condition—concurrent orders over-decremented stock

**Likely Cause:**

- No database row-level locking
- Concurrent update not serialized
- Inventory checking and decrementing not atomic

**Fix:**

```sql
-- Use SELECT FOR UPDATE to lock row
BEGIN TRANSACTION;
SELECT quantity FROM products WHERE id = ? FOR UPDATE;
-- Check quantity, then update
UPDATE products SET quantity = quantity - 1 WHERE id = ?;
COMMIT;
```

---

## Performance Benchmarks

### Expected Response Times

```
Latency (50th percentile): 100-200ms
Latency (95th percentile): 500-1000ms
Latency (99th percentile): 2000-5000ms
```

### Expected Throughput

```
Single Instance: 10-50 req/sec
With Load Balancing: 100-500 req/sec
```

### Expected Error Rates

```
Normal Operation: < 1% errors
Under Load: < 5% errors
Extreme Load: < 10% errors
```

---

## Production Readiness Checklist

- [ ] All tests pass consistently
- [ ] Success rate > 95% under normal load
- [ ] Success rate > 85% under stress load
- [ ] Max response time < 10 seconds
- [ ] Circuit breaker opens when dependency down
- [ ] Idempotency keys prevent duplicates
- [ ] Health endpoints return correct status
- [ ] No connection leaks (netstat shows stable connection count)
- [ ] Logging captures all errors
- [ ] Monitoring alerts on health check failures
- [ ] Backup strategy for database
- [ ] Secrets not in logs
- [ ] CORS properly configured
- [ ] Rate limiting configured
- [ ] Load balancer health checks configured

---

## Advanced: Manual Failure Injection

### Simulate Database Failure

```bash
# On your database server, disconnect connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'survey_corps';"

# Run tests
npm run test:health

# Expected: Health endpoint returns status: DOWN
```

### Simulate Network Latency

```bash
# On macOS (requires sudo)
sudo tc qdisc add dev lo root netem delay 5000ms

# Run tests
npm run test:latency

# Disable after testing
sudo tc qdisc del dev lo root netem
```

### Simulate Service Crash

```bash
# Kill service
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill

# Run tests
npm run test:integration

# Expected: Tests detect failure, fail fast with circuit breaker
```

---

## Troubleshooting

### "ECONNREFUSED" error

**Problem:** Can't connect to service

**Solution:**

```bash
# Check if services are running
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Start missing services
npm run dev
```

### "Jest not found"

**Problem:** Jest CLI not installed

**Solution:**

```bash
npm install --save-dev jest
```

### "Tests hang and don't complete"

**Problem:** One or more tests stuck waiting

**Solution:**

```bash
# Kill hanging test process
pkill -f "node.*jest"

# Run with shorter timeout
npm test -- --testTimeout=5000
```

### "Random test failures"

**Problem:** Tests pass sometimes, fail sometimes

**Solution:**

- Likely race condition or timing issue
- Run tests multiple times: `for i in {1..10}; do npm test; done`
- Check system resource usage while tests run
- Increase timeout values if system is slow

---

## Summary

This test suite validates that the Survey Corps microservices platform can handle:

1. **Predictable latency patterns** without breaking
2. **Health checks** that accurately reflect service state
3. **Partial failures** without causing cascading issues
4. **Distributed transaction consistency** via idempotency
5. **Load and stress** with graceful degradation
6. **Recovery** after transient failures

Run `npm run test:all` regularly to catch regressions early!
