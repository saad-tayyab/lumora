---
id: CON-AR-004
name: Payment
context: BC-AR
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - payment
  - core
---

# Payment

## Definition

A record of funds received from a customer in settlement of one or more invoices. The Payment aggregate tracks the payment method, amount, and date, and links to one or more PaymentApplication records that allocate the payment across invoices.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| payment_number | string(50) | yes | Human-readable payment reference |
| payment_date | date | yes | Date the payment was received |
| amount | numeric(19,4) | yes | Total payment amount |
| payment_method | enum | yes | Cash, Check, BankTransfer, CreditCard, Online |
| reference_number | string(100) | no | External reference (check number, transaction ID) |
| bank_account_id | UUID v7 | no | Reference to bank account in BC-CASH |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Record last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-001 (Customer) | belongs-to | N:1 | Payment belongs to a customer |
| CON-AR-005 (PaymentApplication) | has-many | 1:N | Payment has payment applications |
| CON-AR-010 (PaymentReceived) | triggers | 1:1 | Payment recording emits event |

## Invariants

- INV-FIN-003: Every financial transaction must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: Payment has a globally unique identifier (UUID v7).

## Business Rules

- BR-003: Payment terms (and thus payment timing) are defined per customer.

## Events

- PaymentReceived (CON-AR-010)
- PaymentRefunded

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
