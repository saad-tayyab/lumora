---
id: CTR-AR-001
concept: CON-AR-002
attribute: total_amount
type: range
scope: invoice
description: "Invoice total amount must be greater than zero"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-001: Invoice Total Must Be Positive

## Definition

An invoice must have a total amount greater than zero. An invoice with zero or negative total is not valid.

## Applies To

- **CON-AR-002** (Invoice) — `total_amount` attribute

## Validation

```
total_amount > 0
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#41-financial-invariants) — INV-FIN-004
