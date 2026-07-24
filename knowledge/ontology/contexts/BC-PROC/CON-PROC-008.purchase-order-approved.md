---
id: CON-PROC-008
name: PurchaseOrderApproved
context: BC-PROC
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - event
---

# PurchaseOrderApproved

## Definition

A domain event emitted when a Purchase Order is approved. This event signals that the PO has passed the approval policy checks and is authorized for transmission to the vendor.

## Event Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| po_id | UUID | yes | Purchase order ID (CON-PROC-002) |
| po_number | string(30) | yes | Human-readable PO number |
| vendor_id | UUID | yes | Vendor ID (CON-PROC-001) |
| total | numeric(19,4) | yes | PO total amount |
| approved_by | UUID | yes | User who approved the PO |
| occurred_at | timestamp | yes | Event timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | triggered-by | N:1 | Event is triggered by PO approval |
| CON-PROC-011 (ApprovePurchaseOrder) | produced-by | N:1 | Event is produced by the ApprovePurchaseOrder command |
| CON-PROC-014 (POApprovalPolicy) | enforced-by | N:1 | Approval must comply with POApprovalPolicy |

## Invariants

- INV-PROC-022: Every PurchaseOrderApproved event must reference a valid PO ID.
- INV-PROC-023: The PO must be in "pending_approval" status when this event is emitted.

## Business Rules

- This event is emitted after the ApprovePurchaseOrder command successfully passes the POApprovalPolicy.
- Downstream contexts may subscribe for budget commitment, vendor notification, or reporting.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
