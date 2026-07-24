---
id: CTR-AP-001
concept: CON-AP-003
attribute: bill_number
type: unique
scope: vendor_id
description: "Bill numbers must be unique within a vendor"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-001: Unique Bill Number per Vendor

## Description

Each vendor bill number must be unique within the scope of a single vendor. Two bills from the same vendor cannot share the same bill_number.

## Concept

- CON-AP-003 (Bill)

## Attribute

- `bill_number`

## Scope

- `vendor_id` — uniqueness is scoped per vendor

## Severity

- **error** — Violation prevents bill creation

## Rationale

Prevents duplicate bill entries and ensures accurate accounts payable tracking.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
