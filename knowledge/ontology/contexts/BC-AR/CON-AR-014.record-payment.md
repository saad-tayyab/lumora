---
id: CON-AR-014
name: RecordPayment
context: BC-AR
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - command
  - payment
---

# RecordPayment

## Definition

A command representing the intent to record a payment received from a customer. When executed, this command creates the Payment record, applies the payment to specified invoices, updates invoice balances, and emits a PaymentReceived event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| amount | numeric(19,4) | yes | Total payment amount |
| payment_date | date | yes | Date the payment was received |
| payment_method | enum | yes | Cash, Check, BankTransfer, CreditCard, Online |
| reference_number | string(100) | no | External reference (check number, transaction ID) |
| bank_account_id | UUID v7 | no | Reference to bank account in BC-CASH |
| applications | array | yes | Array of {invoice_id, amount} to apply |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-004 (Payment) | targets | — | Creates a Payment aggregate |
| CON-AR-005 (PaymentApplication) | targets | — | Creates PaymentApplication records |

## Invariants

- INV-FIN-003: Every financial transaction must have an audit trail.
- INV-FIN-004: All monetary values use decimal precision.
- CTR-AR-004: Applied amounts cannot exceed invoice balances.

## Business Rules

- None beyond invariants.

## Events

- Emits PaymentReceived (CON-AR-010) on success.

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
