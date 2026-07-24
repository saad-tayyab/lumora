---
id: CTR-AP-004
concept: CON-AP-004
attribute: bill_id
type: required
description: "BillLineItem must reference a valid Bill"
severity: error
version: 1.0.0
status: active
---

# CTR-AP-004: Line Item Must Reference Valid Bill

## Description

Every BillLineItem must reference an existing Bill via bill_id. Orphaned line items are not permitted.

## Concept

- CON-AP-004 (BillLineItem)

## Attribute

- `bill_id`

## Type

- **required** — Value cannot be null

## Severity

- **error** — Violation prevents line item creation

## Rationale

Ensures referential integrity within the Bill aggregate and prevents orphaned data.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
