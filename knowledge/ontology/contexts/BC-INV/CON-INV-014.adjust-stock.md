---
id: CON-INV-014
name: AdjustStock
context: BC-INV
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - command
  - adjustment
---

# AdjustStock

## Definition
A command that represents the intent to adjust stock quantities for an item in a warehouse. This handles inventory corrections, cycle count adjustments, and damage/loss write-offs. It creates a StockMovement record and emits the StockAdjusted event.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| adjustment_quantity | integer | yes | Quantity change (positive or negative) |
| reason | string(500) | yes | Reason for the adjustment |
| source_document_type | string(50) | yes | Type of source document |
| source_document_id | UUID v7 | yes | Reference to source document |
| initiated_by | UUID v7 | yes | User initiating the adjustment |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-003 (StockMovement) | creates | 1:1 | Command creates a StockMovement |
| CON-INV-010 (StockAdjusted) | produces | 1:1 | Command produces StockAdjusted event |

## Invariants
- adjustment_quantity must not be zero.
- item_id must reference a valid, active Item.
- warehouse_id must reference a valid, active Warehouse.
- result must respect INV-INV-001 (no negative stock unless allowed).

## Business Rules
- INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.

## Events
- CON-INV-010 (StockAdjusted) — emitted on successful execution.
- CON-INV-011 (StockDepleted) — may be emitted if resulting quantity is zero.
- CON-INV-012 (ReorderTriggered) — may be emitted if resulting quantity is below reorder point.

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
