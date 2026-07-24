---
id: CTR-AR-003
concept: CON-AR-006
attribute: amount
type: range
scope: credit_note
description: "Credit note amount must be greater than zero"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-003: Credit Note Amount Must Be Positive

## Definition

A credit note must have an amount greater than zero. Zero or negative credit note amounts are not valid.

## Applies To

- **CON-AR-006** (CreditNote) — `amount` attribute

## Validation

```
amount > 0
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#41-financial-invariants) — INV-FIN-004
