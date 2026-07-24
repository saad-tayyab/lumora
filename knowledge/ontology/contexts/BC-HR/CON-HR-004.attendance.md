---
id: CON-HR-004
name: Attendance
context: BC-HR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - time-tracking
---

# Attendance

## Definition

A record of an employee's presence at work for a specific date. Tracks clock-in and clock-out times, total hours worked, and any overtime hours. Attendance records are used for payroll calculation and compliance reporting.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| employee_id | UUID | yes | Reference to Employee |
| date | date | yes | Attendance date |
| clock_in | timestamp | yes | Clock-in time |
| clock_out | timestamp | no | Clock-out time (null if still clocked in) |
| total_hours | decimal | no | Calculated total hours worked |
| overtime_hours | decimal | no | Overtime hours (hours beyond standard workday) |
| status | enum | yes | Present, Absent, HalfDay, Holiday |
| notes | string(500) | no | Additional notes |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | belongs-to | N:1 | Attendance belongs to one employee |

## Invariants

- INV-HR-009: Clock-out time must be after clock-in time.
- INV-HR-010: Total hours cannot be negative.
- INV-HR-011: One attendance record per employee per date (unique constraint).

## Business Rules

- Overtime hours are calculated based on OvertimePolicy.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
