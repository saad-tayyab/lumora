---
id: CTR-PROC-004
concept: CON-PROC-003
attribute: received_quantity
type: range
scope: aggregate
description: "Received quantity cannot exceed ordered quantity"
severity: error
version: 1.0.0
status: active
---

# CTR-PROC-004: Received Quantity Within Bounds

## Concept
- **CON-PROC-003** (POLineItem)

## Attribute
- `received_quantity`

## Constraint
The received quantity on a line item cannot exceed the ordered quantity. The received quantity must be >= 0 and <= quantity.

## Range
```
0 <= received_quantity <= quantity
```

## Rationale
Prevents over-receipt of goods. Ensures that receiving reports accurately reflect what was ordered and prevents inventory discrepancies.
