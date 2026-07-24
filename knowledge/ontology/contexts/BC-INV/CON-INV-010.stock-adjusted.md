---
id: CON-INV-010
name: StockAdjusted
context: BC-INV
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - event
  - adjustment
  - cross-context
---

# StockAdjusted

## Definition
A domain event emitted when a stock quantity adjustment is recorded for an item in a warehouse. This event is consumed by BC-FIN for cost accounting and by BC-REPORT for inventory analytics. It corresponds to EVT-004 in the Domain Constitution event catalog.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| stock_movement_id | UUID v7 | yes | Reference to StockMovement (CON-INV-003) |
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| previous_quantity | integer | yes | Stock quantity before adjustment |
| adjustment_quantity | integer | yes | Quantity change (positive or negative) |
| new_quantity | integer | yes | Stock quantity after adjustment |
| reason | string(500) | yes | Reason for the adjustment |
| movement_type | enum | yes | INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT |
| occurred_at | timestamp | yes | When the event occurred |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-003 (StockMovement) | follows | 1:1 | Event follows a stock movement |
| CON-INV-001 (Item) | concerns | 1:1 | Event concerns an item |

## Invariants
- new_quantity = previous_quantity + adjustment_quantity.
- Event timestamps must be in UTC.

## Business Rules
- None beyond invariants. Financial impact follows BC-FIN rules.

## Events
- This is an event itself.
- May trigger CON-INV-011 (StockDepleted) if new_quantity = 0.
- May trigger CON-INV-012 (ReorderTriggered) if new_quantity < reorder point.

## References
- [Domain Constitution — Event Catalog EVT-004](../../constitution/DOMAIN.md#7-event-catalog)
