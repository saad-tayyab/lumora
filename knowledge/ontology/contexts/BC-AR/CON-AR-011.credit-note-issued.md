---
id: CON-AR-011
name: CreditNoteIssued
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
  - credit-note
---

# CreditNoteIssued

## Definition

A domain event emitted when a credit note is issued to a customer. This event may trigger adjustments in BC-FIN (revenue reversal or contra-revenue entry) and BC-REPORT (reporting updates).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| credit_note_id | UUID v7 | yes | Reference to the CreditNote (CON-AR-006) |
| customer_id | UUID v7 | yes | Reference to the Customer (CON-AR-001) |
| amount | numeric(19,4) | yes | Credit note amount |
| currency | string(3) | yes | ISO 4217 currency code |
| reason | string(500) | yes | Reason for the credit note |
| occurred_at | timestamp | yes | Timestamp when the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-006 (CreditNote) | triggers | N:1 | Credit note issuance triggers this event |
| BC-FIN | targets | — | Triggers revenue reversal in Financial context |
| BC-REPORT | targets | — | Triggers report refresh in Reporting context |

## Invariants

- INV-CROSS-002: Cross-context communication happens through domain events only.
- INV-CROSS-003: Event has a globally unique identifier (UUID v7).

## Business Rules

- None beyond invariants.

## Events

- This is itself an event.

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
