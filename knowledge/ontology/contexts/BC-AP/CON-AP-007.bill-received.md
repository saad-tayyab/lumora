---
id: CON-AP-007
name: BillReceived
context: BC-AP
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - event
  - bill
---

# BillReceived

## Definition

Domain event emitted when a vendor bill is first created or received into the system. This event signals that a new bill exists and may trigger downstream processes such as three-way matching (if linked to a PO) and approval workflows.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| bill_number | string(50) | yes | Vendor's invoice number |
| total_amount | numeric(19,4) | yes | Total bill amount |
| currency | string(3) | yes | ISO 4217 currency code |
| has_purchase_order | boolean | yes | Whether bill is linked to a PO |
| occurred_at | timestamp | yes | When the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | triggered-by | N:1 | Event is triggered by bill creation |
| BC-FIN (Journal Entry) | triggers | 1:N | May trigger AP liability posting |

## Invariants

- Event must reference a valid bill.
- Event timestamp must be on or after bill creation.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Event Catalog - EVT-003](../../../../constitution/DOMAIN.md#7-event-catalog)
