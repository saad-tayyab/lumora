---
id: CON-INV-011
name: StockDepleted
context: BC-INV
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - event
  - alert
---

# StockDepleted

## Definition
A domain event emitted when the on-hand stock quantity of an item in a specific warehouse reaches zero. This event can trigger reorder processes, notify procurement, and alert warehouse staff.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| last_movement_id | UUID v7 | yes | The StockMovement that caused depletion |
| occurred_at | timestamp | yes | When the depletion occurred |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-003 (StockMovement) | follows | 1:1 | Event follows the depletion-causing movement |
| CON-INV-005 (StockLevel) | reflects | 1:1 | Event reflects a stock level state |

## Invariants
- Event timestamps must be in UTC.
- item_id and warehouse_id must reference valid entities.

## Business Rules
- May trigger BR-005 (reorder point check) as a consequence of depletion.

## Events
- This is an event itself.
- May trigger CON-INV-012 (ReorderTriggered).

## References
- [Domain Constitution — BC-INV](../../constitution/DOMAIN.md#3-core-bounded-contexts)
