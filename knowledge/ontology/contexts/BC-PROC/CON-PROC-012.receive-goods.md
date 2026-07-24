---
id: CON-PROC-012
name: ReceiveGoods
context: BC-PROC
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - receiving
  - command
---

# ReceiveGoods

## Definition

A command representing the intent to confirm the physical receipt of goods against a Purchase Order. This command creates a ReceivingReport and triggers inventory updates and three-way matching.

## Command Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| po_id | UUID | yes | Purchase order being received against (CON-PROC-002) |
| warehouse_id | UUID | yes | Destination warehouse |
| received_date | date | yes | Date goods were received |
| received_by | UUID | yes | User confirming receipt |
| items | array | yes | Array of {po_line_item_id, quantity_received, condition} |
| notes | text | no | Receiving notes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | targets | N:1 | Command targets a specific PO |
| CON-PROC-004 (ReceivingReport) | creates | 1:1 | Command creates a receiving report |
| CON-PROC-009 (GoodsReceived) | produces | 1:1 | Command produces this event |

## Invariants

- INV-PROC-031: PO must be in "approved" or "partially_received" status.
- INV-PROC-032: Received quantity per line item cannot exceed remaining quantity on the PO.
- INV-PROC-033: All referenced line items must belong to the specified PO.

## Business Rules

- BR-004 (from DOMAIN.md): This command supports three-way matching by recording received quantities.
- Partial receipts are allowed; the PO status transitions to "partially_received" or "fully_received" as appropriate.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
