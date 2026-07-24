---
id: CON-INV-012
name: ReorderTriggered
context: BC-INV
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - event
  - automation
  - reorder
---

# ReorderTriggered

## Definition
A domain event emitted when the on-hand stock of an item falls below its configured reorder point (CON-INV-007). This event initiates the automated purchase suggestion process in the Procurement context (BC-PROC).

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| current_quantity | integer | yes | Current on-hand quantity |
| reorder_point | integer | yes | The reorder threshold that was breached |
| suggested_order_quantity | integer | no | Calculated suggested order quantity |
| occurred_at | timestamp | yes | When the reorder was triggered |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-007 (ReorderPoint) | evaluates | 1:1 | Event evaluates against reorder point |
| CON-INV-005 (StockLevel) | reflects | 1:1 | Event reflects stock level below threshold |

## Invariants
- Event timestamps must be in UTC.
- current_quantity must be < reorder_point at time of event emission.

## Business Rules
- BR-005: Reorder points trigger automated purchase suggestions.

## Events
- This is an event itself.
- Cross-context target: BC-PROC (Procurement).

## References
- [Business Rule BR-005](../../constitution/DOMAIN.md#5-business-rules-registry)
