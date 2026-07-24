---
id: CON-AR-010
name: PaymentReceived
context: BC-AR
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - event
  - payment
---

# PaymentReceived

## Definition

A domain event emitted when a payment is recorded against a customer account. This event triggers downstream processing in BC-FIN (revenue recognition) and BC-CASH (bank account reconciliation).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| payment_id | UUID v7 | yes | Reference to the Payment (CON-AR-004) |
| customer_id | UUID v7 | yes | Reference to the Customer (CON-AR-001) |
| amount | numeric(19,4) | yes | Payment amount received |
| currency | string(3) | yes | ISO 4217 currency code |
| payment_method | enum | yes | Cash, Check, BankTransfer, CreditCard, Online |
| bank_account_id | UUID v7 | no | Reference to bank account in BC-CASH |
| occurred_at | timestamp | yes | Timestamp when the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-004 (Payment) | triggers | N:1 | Payment recording triggers this event |
| BC-FIN | targets | — | Triggers revenue recognition in Financial context |
| BC-CASH | targets | — | Triggers bank reconciliation in Cash context |

## Invariants

- INV-CROSS-002: Cross-context communication happens through domain events only.
- INV-CROSS-003: Event has a globally unique identifier (UUID v7).

## Business Rules

- None beyond invariants.

## Events

- This is itself an event.

## References

- [Event Catalog](../../constitution/DOMAIN.md#7-event-catalog) — EVT-002
