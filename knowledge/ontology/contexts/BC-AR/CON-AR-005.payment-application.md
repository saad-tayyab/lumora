---
id: CON-AR-005
name: PaymentApplication
context: BC-AR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - payment
  - application
---

# PaymentApplication

## Definition

A record that allocates a portion of a payment to a specific invoice. A single payment can be applied across multiple invoices, and a single invoice can receive multiple payment applications. This entity links Payment to Invoice and tracks how much of each payment was applied to each invoice.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| payment_id | UUID v7 | yes | Reference to Payment (CON-AR-004) |
| invoice_id | UUID v7 | yes | Reference to Invoice (CON-AR-002) |
| amount_applied | numeric(19,4) | yes | Amount of payment applied to this invoice |
| applied_date | date | yes | Date the application was made |
| created_at | timestamp | yes | Record creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-004 (Payment) | belongs-to | N:1 | Application belongs to a payment |
| CON-AR-002 (Invoice) | belongs-to | N:1 | Application belongs to an invoice |

## Invariants

- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: PaymentApplication has a globally unique identifier (UUID v7).
- CTR-AR-004: Applied amount cannot exceed the invoice balance due.

## Business Rules

- None beyond invariants.

## Events

- None (child entity of Payment aggregate).

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
