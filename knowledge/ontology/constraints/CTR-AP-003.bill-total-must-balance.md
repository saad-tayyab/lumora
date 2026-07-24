---
id: CTR-AP-003
concept: CON-AP-003
attribute: total_amount
type: invariant
description: "Bill total must equal sum of line item amounts plus tax"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-003: Bill Total Must Balance

## Description

The total_amount of a bill must equal the sum of all its BillLineItem amounts plus the tax_amount. This invariant is enforced on every bill create and update operation.

## Concept

- CON-AP-003 (Bill)

## Attributes

- `total_amount`
- `subtotal`
- `tax_amount`

## Type

- **invariant** — Always true for valid state

## Severity

- **error** — Violation prevents bill save

## Rationale

Ensures financial integrity and prevents incorrect liability postings.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- INV-FIN-001: Every journal entry must balance
