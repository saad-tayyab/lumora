---
id: CON-AR-007
name: AgingBucket
context: BC-AR
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - aging
  - reporting
---

# AgingBucket

## Definition

A categorized time range used in accounts receivable aging reports to classify outstanding invoice balances by how long they have been unpaid. Common buckets include Current (not yet due), 1-30 days past due, 31-60 days past due, 61-90 days past due, and 90+ days past due. This is an immutable value object with no identity beyond its attributes.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| label | string(50) | yes | Display name (e.g., "Current", "1-30 Days Past Due") |
| days_from | integer | yes | Lower bound of the bucket in days (inclusive) |
| days_to | integer | no | Upper bound of the bucket in days (null = open-ended) |
| total_amount | numeric(19,4) | yes | Sum of invoice balances in this bucket |
| invoice_count | integer | yes | Number of invoices in this bucket |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| None | — | — | Value object with no references |

## Invariants

- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- None beyond invariants.

## Events

- None (value object).

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
