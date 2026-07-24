---
id: CON-AR-015
name: IssueCreditNote
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
  - credit-note
---

# IssueCreditNote

## Definition

A command representing the intent to issue a credit note to a customer. When executed, this command creates the CreditNote record, validates the reason and amount, and emits a CreditNoteIssued event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| reason | string(500) | yes | Reason for issuing the credit note |
| amount | numeric(19,4) | yes | Credit note amount |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-006 (CreditNote) | targets | — | Creates a CreditNote entity |

## Invariants

- INV-FIN-003: Every financial transaction must have an audit trail.
- INV-FIN-004: All monetary values use decimal precision.

## Business Rules

- None beyond invariants.

## Events

- Emits CreditNoteIssued (CON-AR-011) on success.

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
