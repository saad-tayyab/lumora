---
id: CTR-AP-005
concept: CON-AP-003
attribute: status
type: dependency
description: "Bill must be approved before payment can be processed"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-005: Bill Must Be Approved Before Payment

## Description

A bill must be in approved or partially_paid status before a VendorPayment can reference it. Draft and pending_approval bills cannot be paid.

## Concept

- CON-AP-003 (Bill)

## Attribute

- `status`

## Type

- **dependency** — Requires another condition

## Severity

- **error** — Violation prevents payment processing

## Rationale

Ensures proper segregation of duties and that all bills are reviewed before funds are disbursed.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
