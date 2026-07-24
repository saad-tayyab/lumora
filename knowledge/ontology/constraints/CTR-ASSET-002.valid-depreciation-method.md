---
id: CTR-ASSET-002
name: Valid Depreciation Method
context: BC-ASSET
type: enum
description: "Depreciation method must be one of the allowed values"
severity: error
version: 1.0.0
status: active
---

# CTR-ASSET-002: Valid Depreciation Method

## Statement

Depreciation method must be one of: straight_line, declining_balance, units_of_activity, sum_of_years_digits.

## Rationale

Ensures only recognized depreciation methods are used, maintaining consistency and compliance with accounting standards.

## Implementation

- Enforce enum validation on the `depreciation_method` field at asset creation and update.
- Reject any value not in the allowed set: `straight_line`, `declining_balance`, `units_of_activity`, `sum_of_years_digits`.

## Invariant Reference

- INV-ASSET-001: Every fixed asset must have a depreciation method, useful life, and salvage value at acquisition.
