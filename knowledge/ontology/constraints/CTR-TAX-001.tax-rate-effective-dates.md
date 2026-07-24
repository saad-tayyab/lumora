---
id: CTR-TAX-001
name: Tax Rate Effective Dates
context: BC-TAX
type: invariant
description: "Tax rate effective date must be before expiry date when expiry is set"
severity: error
version: 1.0.0
status: active
---

# CTR-TAX-001: Tax Rate Effective Dates

## Statement

Tax rate effective date must be before expiry date when expiry is set.

## Rationale

Ensures temporal integrity of tax rate versioning. An expired rate cannot precede its effective date, which would create an invalid or empty validity window.

## Implementation

- Validate on tax rate creation and update that `effective_date < expiry_date` when `expiry_date` is not null.
- Reject tax rate records where the expiry date is on or before the effective date.

## Invariant Reference

- INV-TAX-001: Every tax rate must have an effective date and optional expiry date for temporal versioning.
