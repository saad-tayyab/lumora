---
id: CON-INV-001
name: Item
context: BC-INV
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - core
  - aggregate-root
---

# Item

## Definition
The core aggregate root representing a distinct product or material tracked within the inventory system. An item is the fundamental unit of inventory that can be stored, moved, sold, or consumed.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| sku | SKU (CON-INV-006) | yes | Stock Keeping Unit code |
| name | string(200) | yes | Display name |
| description | string(1000) | no | Detailed description |
| category_id | UUID v7 | yes | Reference to ItemCategory (CON-INV-002) |
| unit_of_measure_id | UUID v7 | yes | Reference to UnitOfMeasure (CON-INV-008) |
| is_active | boolean | yes | Whether item is available for transactions |
| is_serialized | boolean | yes | Whether individual units are tracked by serial number |
| is_lot_tracked | boolean | yes | Whether items are tracked by lot |
| reorder_point | ReorderPoint (CON-INV-007) | no | Minimum stock level threshold |
| cost_method | enum | yes | FIFO, LIFO, WeightedAverage, SpecificIdentification |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |
| created_by | UUID v7 | yes | User who created the record |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-002 (ItemCategory) | belongs-to | N:1 | Item belongs to exactly one category |
| CON-INV-005 (StockLevel) | has-many | 1:N | Item has stock levels across warehouses |
| CON-INV-003 (StockMovement) | has-many | 1:N | Item has many stock movements |
| CON-INV-008 (UnitOfMeasure) | uses | N:1 | Item uses a unit of measure |
| CON-INV-006 (SKU) | has-one | 1:1 | Item has a unique SKU value object |
| CON-INV-007 (ReorderPoint) | has-one | 0:1 | Item may have a reorder point |

## Invariants
- INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.
- INV-INV-003: Items must belong to exactly one item category.
- INV-CROSS-003: Item has a globally unique identifier (UUID v7).

## Business Rules
- BR-005: Reorder points trigger automated purchase suggestions.

## Events
- CON-INV-009 (ItemCreated)
- CON-INV-010 (StockAdjusted)
- CON-INV-011 (StockDepleted)
- CON-INV-012 (ReorderTriggered)

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
- [Domain Constitution — BC-INV](../../constitution/DOMAIN.md#3-core-bounded-contexts)
