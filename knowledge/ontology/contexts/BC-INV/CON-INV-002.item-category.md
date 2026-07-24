---
id: CON-INV-002
name: ItemCategory
context: BC-INV
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - classification
---

# ItemCategory

## Definition
A classification entity used to organize items into hierarchical groups. Every item must belong to exactly one item category, enabling organized reporting, filtering, and category-level operations.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Category display name |
| code | string(20) | yes | Short category code |
| description | string(500) | no | Category description |
| parent_id | UUID v7 | no | Parent category for hierarchy |
| is_active | boolean | yes | Whether category is in use |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | has-many | 1:N | Category contains many items |
| CON-INV-002 (ItemCategory) | self-reference | 0:N | Category can have parent/child hierarchy |

## Invariants
- INV-INV-003: Items must belong to exactly one item category.
- Category codes must be unique within a tenant.

## Business Rules
- None beyond invariants.

## Events
- None directly. Category changes may trigger ItemUpdated in downstream contexts.

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
