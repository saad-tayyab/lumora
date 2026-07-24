---
id: CON-INV-003
name: StockMovement
context: BC-INV
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - movement
  - audit-trail
---

# StockMovement

## Definition
An aggregate that records every change in stock quantity for an item within a warehouse. Each stock movement represents an immutable audit trail entry. Movements can be inbound (receipt), outbound (sale/issue), transfer, or adjustment.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| item_id | UUID v7 | yes | Reference to Item (CON-INV-001) |
| warehouse_id | UUID v7 | yes | Reference to Warehouse (CON-INV-004) |
| movement_type | enum | yes | INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT |
| quantity | integer | yes | Quantity moved (positive for inbound, negative for outbound) |
| source_document_type | string(50) | yes | Type of source document (e.g., PO, SO, Transfer) |
| source_document_id | UUID v7 | yes | Reference to source document |
| unit_cost | numeric(19,4) | no | Cost per unit at time of movement |
| total_cost | numeric(19,4) | no | Total cost of movement |
| reference_warehouse_id | UUID v7 | no | Target warehouse for transfers |
| reason | string(500) | no | Reason for adjustment or note |
| movement_date | timestamp | yes | When the movement occurred |
| created_by | UUID v7 | yes | User who initiated the movement |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| created_at | timestamp | yes | Record creation timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | belongs-to | N:1 | Movement belongs to an item |
| CON-INV-004 (Warehouse) | belongs-to | N:1 | Movement occurs in a warehouse |
| CON-INV-004 (Warehouse) | uses | 0:1 | Transfer target warehouse |

## Invariants
- INV-INV-002: Every stock movement must reference a source document.
- INV-INV-001: Stock quantity cannot go negative unless explicitly allowed by configuration.
- INV-CROSS-003: StockMovement has a globally unique identifier (UUID v7).
- INV-CROSS-003: Every state change produces an audit event.

## Business Rules
- None beyond invariants. Cost calculations follow financial context rules (BC-FIN).

## Events
- CON-INV-010 (StockAdjusted)
- CON-INV-011 (StockDepleted)

## References
- [Domain Constitution — Inventory Invariants](../../constitution/DOMAIN.md#42-inventory-invariants)
- [Event Catalog — StockAdjusted](../../constitution/DOMAIN.md#7-event-catalog)
