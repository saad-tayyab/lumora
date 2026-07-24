---
id: CON-INV-016
name: NegativeStockPolicy
context: BC-INV
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - policy
  - invariant
  - configuration
---

# NegativeStockPolicy

## Definition
A business policy that governs whether stock quantities are allowed to go negative. By default, stock cannot be negative (INV-INV-001). This policy can be configured per-tenant to allow negative stock in specific scenarios (e.g., backorder fulfillment, drop-shipping).

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| allow_negative_stock | boolean | yes | Global flag for allowing negative stock |
| allowed_movement_types | list(enum) | no | Movement types allowed to result in negative stock |
| allowed_warehouse_ids | list(UUID v7) | no | Specific warehouses where negative stock is allowed |
| notification_enabled | boolean | yes | Whether to notify when stock goes negative |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-005 (StockLevel) | validates | 1:N | Policy validates stock levels |
| CON-INV-003 (StockMovement) | constrains | 1:N | Policy constrains stock movements |

## Invariants
- allow_negative_stock defaults to false.
- When allow_negative_stock is false, all movements must result in quantity_on_hand >= 0.

## Business Rules
- INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.

## Events
- None directly. Policy is evaluated during command execution.

## References
- [Domain Constitution — Inventory Invariant INV-INV-001](../../constitution/DOMAIN.md#42-inventory-invariants)
