---
id: CON-INV-007
name: ReorderPoint
context: BC-INV
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - planning
  - automation
---

# ReorderPoint

## Definition
An immutable value object defining the minimum stock threshold for an item. When the available quantity on hand falls below this point, the system triggers automated purchase suggestions. The reorder point encapsulates both the minimum quantity and optional lead time configuration.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| minimum_quantity | integer | yes | Minimum stock level before reorder trigger |
| optimal_quantity | integer | no | Target stock level for reorder |
| lead_time_days | integer | no | Expected supplier lead time in days |
| safety_stock | integer | no | Buffer stock to protect against demand variability |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | configures | 0:1 | An item may have a reorder point configured |

## Invariants
- minimum_quantity must be >= 0.
- optimal_quantity must be >= minimum_quantity when provided.
- safety_stock must be >= 0.
- lead_time_days must be >= 0.

## Business Rules
- BR-005: Reorder points trigger automated purchase suggestions.

## Events
- CON-INV-012 (ReorderTriggered) — emitted when stock falls below reorder point.

## References
- [Business Rule BR-005](../../constitution/DOMAIN.md#5-business-rules-registry)
