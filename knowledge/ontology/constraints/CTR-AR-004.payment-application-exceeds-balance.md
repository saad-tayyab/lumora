---
id: CTR-AR-004
concept: CON-AR-005
attribute: amount_applied
type: dependency
scope: payment_application
description: "Applied amount cannot exceed invoice balance due"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-004: Payment Application Cannot Exceed Invoice Balance

## Definition

The amount applied by a PaymentApplication to an Invoice cannot exceed the Invoice's current balance due. This prevents overpayment and ensures accounting integrity.

## Applies To

- **CON-AR-005** (PaymentApplication) — `amount_applied` attribute
- **CON-AR-002** (Invoice) — `balance_due` attribute

## Validation

```
amount_applied <= invoice.balance_due
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#41-financial-invariants) — INV-FIN-001
