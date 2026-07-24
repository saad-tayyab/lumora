---
id: CTR-AR-005
concept: CON-AR-003
attribute: quantity
type: range
scope: invoice_line_item
description: "Line item quantity must be greater than zero"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-005: Line Item Quantity Must Be Positive

## Definition

An invoice line item must have a quantity greater than zero. Zero or negative quantities are not valid for billing purposes.

## Applies To

- **CON-AR-003** (InvoiceLineItem) — `quantity` attribute

## Validation

```
quantity > 0
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#41-financial-invariants) — INV-FIN-004
