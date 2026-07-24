---
id: CON-AR-006
name: CreditNote
context: BC-AR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - credit-note
---

# CreditNote

## Definition

A document issued to a customer that reduces the amount they owe. Credit notes are used for returns, allowances, corrections, or goodwill adjustments. A credit note can be applied against one or more outstanding invoices.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| credit_note_number | string(50) | yes | Human-readable credit note number |
| status | enum | yes | Draft, Issued, Applied, Voided |
| issue_date | date | yes | Date the credit note was issued |
| reason | string(500) | yes | Reason for the credit note |
| amount | numeric(19,4) | yes | Total credit amount |
| amount_applied | numeric(19,4) | yes | Amount already applied to invoices |
| balance | numeric(19,4) | yes | Remaining unapplied amount |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Record last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-001 (Customer) | belongs-to | N:1 | Credit note belongs to a customer |
| CON-AR-011 (CreditNoteIssued) | triggers | 1:1 | Issuance emits event |

## Invariants

- INV-FIN-003: Every financial transaction must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: CreditNote has a globally unique identifier (UUID v7).

## Business Rules

- None beyond invariants.

## Events

- CreditNoteIssued (CON-AR-011)
- CreditNoteApplied
- CreditNoteVoided

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
