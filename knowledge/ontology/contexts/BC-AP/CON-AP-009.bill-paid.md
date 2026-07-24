---
id: CON-AP-009
name: BillPaid
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
  - payment
---

# BillPaid

## Definition

Domain event emitted when a vendor bill has been fully or partially paid. This event signals the completion of the payment cycle for a bill and triggers financial postings to update accounts payable and cash accounts.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| vendor_payment_id | UUID v7 | yes | Reference to CON-AP-002 (VendorPayment) |
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| amount_paid | numeric(19,4) | yes | Amount paid in this transaction |
| currency | string(3) | yes | ISO 4217 currency code |
| is_fully_paid | boolean | yes | Whether the bill is now fully paid |
| paid_at | timestamp | yes | When the payment was made |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | triggered-by | N:1 | Event is triggered by payment |
| CON-AP-002 (VendorPayment) | triggered-by | N:1 | Event is caused by a vendor payment |
| BC-FIN (Journal Entry) | triggers | 1:N | Triggers AP and cash journal entries |

## Invariants

- Amount paid must not exceed the remaining unpaid balance of the bill.
- Bill must be in approved or partially_paid status before payment event.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
