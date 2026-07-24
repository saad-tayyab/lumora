---
id: CTR-AP-006
concept: CON-AP-002
attribute: total_amount
type: invariant
description: "Payment amount must equal sum of paid bill amounts"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-006: Payment Amount Must Equal Sum of Bill Amounts

## Description

The total_amount of a VendorPayment must equal the sum of the amounts applied to each bill being paid. Discrepancies are not permitted.

## Concept

- CON-AP-002 (VendorPayment)

## Attribute

- `total_amount`

## Type

- **invariant** — Always true for valid state

## Severity

- **error** — Violation prevents payment save

## Rationale

Ensures financial integrity and that payments accurately reflect the liabilities being settled.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- INV-FIN-001: Every journal entry must balance
