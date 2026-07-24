---
id: CON-AP-003
name: Bill
context: BC-AP
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - bill
  - aggregate
---

# Bill

## Definition

An aggregate representing a vendor invoice (bill) received by the organization. Contains the header information and encapsulates a collection of line items. Bills may be linked to purchase orders and are subject to three-way matching and approval workflows before payment.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| bill_number | string(50) | yes | Vendor's invoice number |
| bill_date | date | yes | Date on the vendor's invoice |
| due_date | date | yes | Payment due date |
| purchase_order_id | UUID v7 | no | Reference to linked PO from BC-PROC |
| subtotal | numeric(19,4) | yes | Sum of line item amounts before tax |
| tax_amount | numeric(19,4) | yes | Total tax amount |
| total_amount | numeric(19,4) | yes | Total bill amount (subtotal + tax) |
| currency | string(3) | yes | ISO 4217 currency code |
| status | enum | yes | draft, pending_approval, approved, partially_paid, paid, voided |
| notes | text | no | Additional notes or memo |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |
| created_by | UUID v7 | yes | User who created the record |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-001 (Vendor) | belongs-to | N:1 | Bill belongs to one vendor |
| CON-AP-004 (BillLineItem) | has-many | 1:N | Bill contains many line items |
| CON-AP-005 (PaymentSchedule) | has-one | 1:1 | Bill has one payment schedule |
| CON-AP-007 (BillReceived) | triggers | 1:1 | Bill creation triggers BillReceived event |

## Invariants

- INV-FIN-001: Total amount must equal sum of line item amounts plus tax.
- INV-FIN-003: Every bill must have an audit trail.
- INV-FIN-004: Currency amounts stored with decimal precision.
- INV-AP-001: Bill number must be unique per vendor.

## Business Rules

- BR-004: Three-way matching required for PO-based bills.
- Bills linked to a PO must pass three-way matching before approval.
- Voided bills retain their record for audit purposes.

## Events

- BillReceived (CON-AP-007)
- BillApproved (CON-AP-008)

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
