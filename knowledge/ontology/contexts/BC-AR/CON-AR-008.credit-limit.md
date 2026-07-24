---
id: CON-AR-008
name: CreditLimit
context: BC-AR
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - credit
  - risk
---

# CreditLimit

## Definition

A value object representing the maximum outstanding balance a customer is allowed to carry. The credit limit is evaluated before approving new invoices to manage credit risk. It is defined per customer and can be adjusted through a credit review process.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | numeric(19,4) | yes | Maximum credit amount allowed |
| currency | string(3) | yes | ISO 4217 currency code |
| effective_date | date | yes | Date the limit became effective |
| review_date | date | no | Next scheduled review date |
| approved_by | string(100) | no | Name or ID of the approver |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| None | — | — | Value object with no references |

## Invariants

- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-003: Payment terms (including credit limits) are defined per customer.

## Events

- None (value object).

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
