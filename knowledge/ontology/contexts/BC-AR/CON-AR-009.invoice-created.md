---
id: CON-AR-009
name: InvoiceCreated
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
---

# InvoiceCreated

## Definition

A domain event emitted when a new invoice is successfully created and saved. This event triggers downstream processing in BC-FIN (journal entry creation) and BC-REPORT (reporting updates).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| invoice_id | UUID v7 | yes | Reference to the created Invoice (CON-AR-002) |
| customer_id | UUID v7 | yes | Reference to the Customer (CON-AR-001) |
| total_amount | numeric(19,4) | yes | Total invoice amount |
| currency | string(3) | yes | ISO 4217 currency code |
| due_date | date | yes | Payment due date |
| occurred_at | timestamp | yes | Timestamp when the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-002 (Invoice) | triggers | N:1 | Invoice creation triggers this event |
| BC-FIN | targets | — | Triggers journal entry creation in Financial context |
| BC-REPORT | targets | — | Triggers report refresh in Reporting context |

## Invariants

- INV-CROSS-002: Cross-context communication happens through domain events only.
- INV-CROSS-003: Event has a globally unique identifier (UUID v7).

## Business Rules

- None beyond invariants.

## Events

- This is itself an event.

## References

- [Event Catalog](../../constitution/DOMAIN.md#7-event-catalog) — EVT-001
