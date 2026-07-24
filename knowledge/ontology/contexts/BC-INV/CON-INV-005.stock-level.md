---
id: CON-INV-005
name: StockLevel
context: BC-INV
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - stock
  - quantity
---

# StockLevel

## Definition
An immutable value object representing the current stock quantity of a specific item within a specific warehouse. StockLevel is derived from the accumulation of all StockMovement records for the item-warehouse combination. It is not independently mutable; changes occur only through StockMovement creation.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| quantity_on_hand | integer | yes | Current physical stock count |
| quantity_reserved | integer | yes | Quantity reserved for orders |
| quantity_available | integer | yes | On-hand minus reserved |
| quantity_on_order | integer | yes | Quantity ordered but not yet received |
| last_counted_at | timestamp | no | When stock was last physically counted |
| last_movement_at | timestamp | no | When last stock movement occurred |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | belongs-to | N:1 | Stock level is for a specific item |
| CON-INV-004 (Warehouse) | belongs-to | N:1 | Stock level is in a specific warehouse |

## Invariants
- INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.
- quantity_available = quantity_on_hand - quantity_reserved.
- quantity_on_hand must be >= 0 (unless negative stock is explicitly allowed).
- The combination of (item_id, warehouse_id) is unique.

## Business Rules
- BR-005: Reorder points trigger automated purchase suggestions when quantity_on_hand falls below reorder threshold.

## Events
- CON-INV-011 (StockDepleted) — triggered when quantity_on_hand reaches zero.
- CON-INV-012 (ReorderTriggered) — triggered when quantity_on_hand falls below reorder point.

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
- [Business Rule BR-005](../../constitution/DOMAIN.md#5-business-rules-registry)
