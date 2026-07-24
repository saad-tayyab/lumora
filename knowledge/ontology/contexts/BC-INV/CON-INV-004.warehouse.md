---
id: CON-INV-004
name: Warehouse
context: BC-INV
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - location
  - storage
---

# Warehouse

## Definition
A physical or logical location where inventory items are stored. Warehouses provide the spatial dimension for stock tracking, enabling multi-location inventory management and stock transfers between locations.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Warehouse display name |
| code | string(20) | yes | Short warehouse code |
| address_line1 | string(200) | no | Physical address |
| address_line2 | string(200) | no | Address continuation |
| city | string(100) | no | City |
| state | string(100) | no | State/Province |
| postal_code | string(20) | no | Postal/ZIP code |
| country | string(3) | no | ISO 3166-1 alpha-3 country code |
| is_active | boolean | yes | Whether warehouse is operational |
| is_default | boolean | yes | Whether this is the default warehouse |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-005 (StockLevel) | has-many | 1:N | Warehouse has stock levels for items |
| CON-INV-003 (StockMovement) | has-many | 1:N | Warehouse has many movements |

## Invariants
- Warehouse codes must be unique within a tenant.
- INV-CROSS-003: Warehouse has a globally unique identifier (UUID v7).

## Business Rules
- None beyond invariants.

## Events
- None directly.

## References
- [Domain Constitution — BC-INV](../../constitution/DOMAIN.md#3-core-bounded-contexts)
