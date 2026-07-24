---
id: CON-PROC-007
name: PurchaseOrderCreated
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

# PurchaseOrderCreated

## Definition

A domain event emitted when a new Purchase Order is created. This event signals to other bounded contexts (e.g., BC-FIN for budget tracking, BC-REPORT for analytics) that a procurement request has been initiated.

## Event Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| po_id | UUID | yes | Purchase order ID (CON-PROC-002) |
| po_number | string(30) | yes | Human-readable PO number |
| vendor_id | UUID | yes | Vendor ID (CON-PROC-001) |
| total | numeric(19,4) | yes | PO total amount |
| currency | string(3) | yes | ISO 4217 currency code |
| created_by | UUID | yes | User who created the PO |
| occurred_at | timestamp | yes | Event timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | triggered-by | N:1 | Event is triggered by PO creation |
| CON-PROC-010 (CreatePurchaseOrder) | produced-by | N:1 | Event is produced by the CreatePurchaseOrder command |

## Invariants

- INV-PROC-021: Every PurchaseOrderCreated event must reference a valid PO ID.

## Business Rules

- This event is emitted after the CreatePurchaseOrder command is successfully executed.
- Downstream contexts may subscribe to this event for budget validation, notification, or analytics.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
