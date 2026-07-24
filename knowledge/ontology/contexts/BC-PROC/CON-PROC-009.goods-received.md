---
id: CON-PROC-009
name: GoodsReceived
context: BC-PROC
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - receiving
  - event
---

# GoodsReceived

## Definition

A domain event emitted when goods are confirmed as received against a Purchase Order. This event triggers inventory updates in BC-INV and supports three-way matching for payment processing.

## Event Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| receiving_report_id | UUID | yes | Receiving report ID (CON-PROC-004) |
| po_id | UUID | yes | Purchase order ID (CON-PROC-002) |
| vendor_id | UUID | yes | Vendor ID (CON-PROC-001) |
| warehouse_id | UUID | yes | Destination warehouse ID |
| items | array | yes | Array of {item_id, quantity_received} |
| received_by | UUID | yes | User who confirmed receipt |
| occurred_at | timestamp | yes | Event timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-004 (ReceivingReport) | triggered-by | N:1 | Event is triggered by receiving confirmation |
| CON-PROC-002 (PurchaseOrder) | related-to | N:1 | Event relates to a specific PO |
| CON-PROC-012 (ReceiveGoods) | produced-by | N:1 | Event is produced by the ReceiveGoods command |

## Invariants

- INV-PROC-024: Every GoodsReceived event must reference a valid receiving report ID.
- INV-PROC-025: The receiving report must be in "confirmed" status when this event is emitted.

## Business Rules

- This event triggers stock adjustments in BC-INV (via INV-004 StockAdjusted event).
- This event supports three-way matching for payment processing in BC-AP.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
