---
id: CON-AP-002
name: VendorPayment
context: BC-AP
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - payment
  - aggregate-root
---

# VendorPayment

## Definition

An aggregate root representing a payment made to a vendor. Encapsulates the payment transaction, its line items (which bills are being paid), and the payment method. Ensures consistency of payment state and total amounts.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| payment_number | string(50) | yes | System-generated payment reference |
| payment_date | date | yes | Date payment was made |
| payment_method | enum | yes | bank_transfer, check, cash, credit_card |
| bank_account_id | UUID v7 | yes | Source bank account from BC-CASH |
| total_amount | numeric(19,4) | yes | Total payment amount in minor units |
| currency | string(3) | yes | ISO 4217 currency code |
| reference | string(200) | no | External reference (check number, wire ref) |
| status | enum | yes | pending, completed, voided |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |
| created_by | UUID v7 | yes | User who created the record |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-001 (Vendor) | belongs-to | N:1 | Payment is made to one vendor |
| CON-AP-009 (BillPaid) | triggers | 1:N | Payment triggers BillPaid events |

## Invariants

- INV-FIN-001: Total amount must equal sum of line item amounts.
- INV-FIN-003: Every payment must have an audit trail.
- INV-FIN-004: Currency amounts stored with decimal precision.
- INV-AUTH-003: Soft deletion is mandatory.

## Business Rules

- Payment amounts must match the sum of paid bill amounts.
- Voided payments must retain their record for audit.

## Events

- BillPaid (CON-AP-009)

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Domain Constitution - BC-CASH](../../../../constitution/DOMAIN.md)
