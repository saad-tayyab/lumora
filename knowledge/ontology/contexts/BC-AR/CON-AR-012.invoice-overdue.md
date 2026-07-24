---
id: CON-AR-012
name: InvoiceOverdue
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
  - invoice
  - overdue
---

# InvoiceOverdue

## Definition

A domain event emitted when an invoice passes its due date without full payment. This event triggers dunning processes (reminder notifications) and may affect customer credit status.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| invoice_id | UUID v7 | yes | Reference to the overdue Invoice (CON-AR-002) |
| customer_id | UUID v7 | yes | Reference to the Customer (CON-AR-001) |
| balance_due | numeric(19,4) | yes | Outstanding balance on the invoice |
| days_overdue | integer | yes | Number of days past the due date |
| occurred_at | timestamp | yes | Timestamp when the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-002 (Invoice) | triggers | N:1 | Invoice due date passing triggers this event |
| CON-AR-017 (DunningPolicy) | triggers | — | May trigger dunning policy actions |

## Invariants

- INV-CROSS-002: Cross-context communication happens through domain events only.
- INV-CROSS-003: Event has a globally unique identifier (UUID v7).

## Business Rules

- None beyond invariants.

## Events

- This is itself an event.

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
