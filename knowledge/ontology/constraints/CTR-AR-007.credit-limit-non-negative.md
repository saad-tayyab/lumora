---
id: CTR-AR-007
concept: CON-AR-008
attribute: amount
type: range
scope: credit_limit
description: "Credit limit amount must be non-negative"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-007: Credit Limit Must Be Non-Negative

## Definition

A credit limit amount must be zero or positive. A zero credit limit means the customer has no credit allowed (cash-only). A negative credit limit is not valid.

## Applies To

- **CON-AR-008** (CreditLimit) — `amount` attribute

## Validation

```
amount >= 0
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#5-business-rules-registry) — BR-003
