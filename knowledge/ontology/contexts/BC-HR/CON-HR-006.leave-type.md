---
id: CON-HR-006
name: LeaveType
context: BC-HR
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - leave-management
---

# LeaveType

## Definition

An immutable value object representing the category of leave (e.g., Annual, Sick, Personal, Maternity, Paternity). Defines the rules for each leave category including maximum allowed days and whether it is paid or unpaid.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string(20) | yes | Leave type code (e.g., "ANN", "SCK") |
| name | string(100) | yes | Leave type name |
| description | string(500) | no | Leave type description |
| max_days_per_year | integer | yes | Maximum days allowed per year |
| is_paid | boolean | yes | Whether leave is paid |
| is_carry_forward | boolean | yes | Whether unused days carry forward |
| status | enum | yes | Active, Inactive |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-005 (LeaveRequest) | has-many | 1:N | Many leave requests can reference same type |

## Invariants

- INV-HR-016: Leave type codes must be unique.
- INV-HR-017: Max days per year must be non-negative.
- INV-HR-018: Value object is immutable — changes create new instance.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
