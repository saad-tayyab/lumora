---
id: CON-INV-013
name: CreateItem
context: BC-INV
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - command
  - lifecycle
---

# CreateItem

## Definition
A command that represents the intent to create a new item in the inventory system. When executed, it validates all required attributes, assigns a UUID v7, and emits the ItemCreated event.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| sku | string(50) | yes | SKU code for the new item |
| name | string(200) | yes | Item display name |
| description | string(1000) | no | Item description |
| category_id | UUID v7 | yes | Reference to ItemCategory (CON-INV-002) |
| unit_of_measure_id | UUID v7 | yes | Reference to UnitOfMeasure (CON-INV-008) |
| is_serialized | boolean | yes | Whether individual units are tracked |
| is_lot_tracked | boolean | yes | Whether items are tracked by lot |
| cost_method | enum | yes | FIFO, LIFO, WeightedAverage, SpecificIdentification |
| reorder_point | ReorderPoint (CON-INV-007) | no | Optional reorder point configuration |
| created_by | UUID v7 | yes | User creating the item |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | creates | 1:1 | Command creates one Item |
| CON-INV-009 (ItemCreated) | produces | 1:1 | Command produces ItemCreated event |

## Invariants
- SKU must be unique within the tenant.
- category_id must reference a valid, active ItemCategory.
- unit_of_measure_id must reference a valid UnitOfMeasure.

## Business Rules
- None beyond invariants.

## Events
- CON-INV-009 (ItemCreated) — emitted on successful execution.

## References
- [Domain Constitution — BC-INV](../../constitution/DOMAIN.md#3-core-bounded-contexts)
