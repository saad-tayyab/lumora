# Observability Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Platform Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines observability standards for the Lumora ERP system.

---

## 2. Observability Pillars

| Pillar | Purpose | Tool |
|--------|---------|------|
| Logging | Record events | Application logs |
| Metrics | Measure performance | Application metrics |
| Tracing | Track requests | Distributed tracing |

---

## 3. Logging

### 3.1 Log Levels

| Level | When to Use |
|-------|-------------|
| `debug` | Development debugging |
| `info` | Normal operations |
| `warn` | Unexpected but handled |
| `error` | Failures requiring attention |

### 3.2 Log Format

```typescript
// Always use structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Invoice created',
  context: {
    invoiceId: 'inv-123',
    customerId: 'cust-456',
    amount: 100.00,
  },
  timestamp: new Date().toISOString(),
}));
```

### 3.3 What to Log

| Event | Level | Data |
|-------|-------|------|
| API request | info | method, path, status, duration |
| Business event | info | entity, action, user |
| Validation error | warn | field, value, reason |
| System error | error | error, stack, context |
| Security event | info | action, user, ip |

### 3.4 What NOT to Log

- Passwords or secrets
- Full credit card numbers
- Personal health information
- Social security numbers
- Raw user input (sanitized only)

---

## 4. Metrics

### 4.1 Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration` | Histogram | Request duration |
| `db_query_duration` | Histogram | Database query duration |
| `active_users` | Gauge | Currently active users |
| `error_rate` | Counter | Total errors |

### 4.2 Custom Metrics

```typescript
// Track business metrics
metrics.increment('invoice.created', {
  customer_type: 'enterprise',
  amount_range: '1000-5000',
});
```

---

## 5. Tracing

### 5.1 Trace Context

```typescript
// Always propagate trace context
const traceId = generateTraceId();
console.log(`[trace:${traceId}] Starting operation`);

// In downstream calls
const headers = { 'x-trace-id': traceId };
```

### 5.2 Span Creation

```typescript
// Create spans for important operations
function processInvoice(id: string) {
  const span = tracer.startSpan('processInvoice');
  try {
    span.setAttribute('invoice.id', id);
    // Process invoice
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

---

## 6. Alerting

### 6.1 Alert Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 1% | Critical | Page on-call |
| Response time > 500ms | Warning | Notify team |
| CPU > 80% for 5min | Warning | Notify team |
| Memory > 80% for 5min | Warning | Notify team |
| Database connections > 80% | Critical | Page on-call |

### 6.2 Alert Routing

```
Critical → PagerDuty → On-call engineer
Warning → Slack #alerts
Info → Log only
```

---

## 7. Best Practices

1. **Always use structured logging** — Machine-readable format.
2. **Always include correlation IDs** — Track requests across services.
3. **Always log business events** — For audit trail.
4. **Never log sensitive data** — Sanitize before logging.
5. **Always set alerts** — Don't rely on manual monitoring.
6. **Always test alerting** — Ensure alerts work.

---

## 8. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Logging sensitive data | Sanitize before logging |
| Unstructured logs | Use JSON format |
| No correlation IDs | Add correlation IDs |
| No alerting | Set up alerting |
| Alert fatigue | Tune alert thresholds |
| No log rotation | Implement log rotation |
