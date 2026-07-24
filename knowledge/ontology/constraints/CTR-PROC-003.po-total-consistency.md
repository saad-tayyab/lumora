---
id: CTR-PROC-003
concept: CON-PROC-002
attribute: total
type: invariant
scope: aggregate
description: "PO total must equal sum of line items plus tax"
severity: error
version: 1.0.0
status: active
---

# CTR-PROC-003: PO Total Consistency

## Concept
- **CON-PROC-002** (PurchaseOrder)

## Attribute
- `total`

## Constraint
The PO total must equal the sum of all line item amounts (subtotal) plus the tax amount. This invariant must be maintained at all times.

## Formula
```
total = subtotal + tax_amount
subtotal = SUM(line_item.amount)
```

## Rationale
Ensures financial consistency of the purchase order. Any discrepancy between the aggregate total and the sum of line items would indicate a data integrity issue.
