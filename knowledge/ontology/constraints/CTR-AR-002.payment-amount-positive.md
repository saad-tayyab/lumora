---
id: CTR-AR-002
concept: CON-AR-004
attribute: amount
type: range
scope: payment
description: "Payment amount must be greater than zero"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-002: Payment Amount Must Be Positive

## Definition

A payment must have an amount greater than zero. Zero or negative payment amounts are not valid.

## Applies To

- **CON-AR-004** (Payment) — `amount` attribute

## Validation

```
amount > 0
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#41-financial-invariants) — INV-FIN-004
