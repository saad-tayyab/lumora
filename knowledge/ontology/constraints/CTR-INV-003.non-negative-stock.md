---
id: CTR-INV-003
concept: CON-INV-005 (StockLevel)
attribute: quantity_on_hand
type: invariant
scope: item_warehouse
description: "Stock quantity cannot go negative unless explicitly allowed by configuration"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-003: Non-Negative Stock Level

## Rule
The quantity_on_hand of a StockLevel must be >= 0 at all times, unless the NegativeStockPolicy (CON-INV-016) explicitly allows negative stock for the tenant.

## Invariant Reference
INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.

## Evaluation
Checked on every StockMovement creation or adjustment. If the resulting quantity_on_hand would be < 0 and NegativeStockPolicy.allow_negative_stock is false, the operation is rejected.

## Violation
Any stock movement that would result in a negative quantity_on_hand when negative stock is not allowed.
