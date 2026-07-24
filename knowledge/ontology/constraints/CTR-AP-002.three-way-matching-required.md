---
id: CTR-AP-002
concept: CON-AP-003
attribute: status
type: invariant
description: "PO-linked bills must pass three-way matching before approval"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-002: Three-Way Matching Required for PO-Linked Bills

## Description

A bill that is linked to a purchase order (purchase_order_id is not null) must have a passing ThreeWayMatchResult before its status can transition to approved.

## Concept

- CON-AP-003 (Bill)

## Attribute

- `status` — transition to `approved` is gated

## Type

- **invariant** — Always true for valid state

## Severity

- **error** — Violation prevents bill approval

## Business Rule Reference

- BR-004: Three-way matching required for PO-based bills

## Rationale

Ensures that goods/services ordered, received, and invoiced are consistent before the organization commits to payment.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Business Rules Registry - BR-004](../../../../constitution/DOMAIN.md#5-business-rules-registry)
