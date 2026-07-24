---
id: CON-INV-009
name: ItemCreated
context: BC-INV
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - event
  - lifecycle
---

# ItemCreated

## Definition
A domain event emitted when a new item is successfully created in the inventory system. This event signals to other bounded contexts (e.g., BC-FIN, BC-PROC) that a new product is available for procurement, sales, and financial tracking.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| item_id | UUID v7 | yes | Reference to the created Item (CON-INV-001) |
| sku | string(50) | yes | SKU of the new item |
| name | string(200) | yes | Name of the new item |
| category_id | UUID v7 | yes | Category of the new item |
| occurred_at | timestamp | yes | When the event occurred |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | follows | 1:1 | Event follows item creation |

## Invariants
- Every ItemCreated event must reference a valid item_id.
- Event timestamps must be in UTC.

## Business Rules
- None beyond invariants.

## Events
- This is an event itself. It may trigger downstream events in other contexts.

## References
- [Domain Constitution — Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
