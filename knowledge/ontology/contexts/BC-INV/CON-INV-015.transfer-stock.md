---
id: CON-INV-015
name: TransferStock
context: BC-INV
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - command
  - transfer
---

# TransferStock

## Definition
A command that represents the intent to transfer stock of an item from one warehouse to another. This creates two StockMovement records (outbound from source, inbound to destination) and emits StockAdjusted events for both warehouses.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| source_warehouse_id | UUID v7 | yes | Reference to source Warehouse (CON-INV-004) |
| target_warehouse_id | UUID v7 | yes | Reference to target Warehouse (CON-INV-004) |
| quantity | integer | yes | Quantity to transfer (must be positive) |
| source_document_type | string(50) | yes | Type of source document |
| source_document_id | UUID v7 | yes | Reference to source document |
| reason | string(500) | no | Reason for the transfer |
| initiated_by | UUID v7 | yes | User initiating the transfer |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-003 (StockMovement) | creates | 1:2 | Command creates two StockMovement records |
| CON-INV-010 (StockAdjusted) | produces | 2:2 | Command produces StockAdjusted events for both warehouses |

## Invariants
- source_warehouse_id and target_warehouse_id must be different.
- quantity must be > 0.
- Source warehouse must have sufficient stock (respecting INV-INV-001).
- Both warehouses must be active.

## Business Rules
- INV-INV-001: Source warehouse stock cannot go negative.

## Events
- CON-INV-010 (StockAdjusted) — emitted twice (once for source, once for target).
- CON-INV-011 (StockDepleted) — may be emitted for source warehouse.
- CON-INV-012 (ReorderTriggered) — may be emitted for source warehouse.

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
