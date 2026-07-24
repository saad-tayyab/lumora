---
id: CON-AP-012
name: ProcessPayment
context: BC-AP
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - command
  - payment
---

# ProcessPayment

## Definition

Command representing the intent to process a payment to a vendor. When executed, this command creates a VendorPayment aggregate, updates the bill status, and emits BillPaid events. May pay one or multiple bills in a single payment.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| bill_ids | array of UUID v7 | yes | Bills being paid by this payment |
| bank_account_id | UUID v7 | yes | Source bank account from BC-CASH |
| payment_method | enum | yes | bank_transfer, check, cash, credit_card |
| payment_date | date | yes | Date payment is made |
| total_amount | numeric(19,4) | yes | Total payment amount |
| currency | string(3) | yes | ISO 4217 currency code |
| reference | string(200) | no | External reference (check number, wire ref) |
| processed_by | UUID v7 | yes | User processing the payment |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-002 (VendorPayment) | creates | 1:1 | Command creates one payment |
| CON-AP-009 (BillPaid) | triggers | 1:N | Command execution emits BillPaid events |
| CON-AP-014 (ApprovalWorkflow) | enforced-by | 1:1 | Payment requires prior approval |

## Invariants

- All referenced bills must be in approved or partially_paid status.
- Total payment amount must equal sum of amounts applied to each bill.
- Bank account must exist in BC-CASH.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Domain Constitution - BC-CASH](../../../../constitution/DOMAIN.md)
