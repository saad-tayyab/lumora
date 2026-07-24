---
id: CON-HR-013
name: PayrollProcessed
context: BC-HR
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - events
  - payroll
---

# PayrollProcessed

## Definition

A domain event emitted when a payroll run is completed. This event signals that all payslips have been generated and payments are ready to be executed. May trigger notifications to employees and financial record updates.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| payroll_id | UUID | yes | Reference to Payroll |
| period_start | date | yes | Payroll period start |
| period_end | date | yes | Payroll period end |
| total_gross_pay | decimal | yes | Total gross pay for the run |
| total_net_pay | decimal | yes | Total net pay for the run |
| employee_count | integer | yes | Number of employees included |
| timestamp | timestamp | yes | When the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-007 (Payroll) | triggers | 1:1 | Event is triggered by Payroll completion |

## Invariants

- INV-HR-035: Event must reference a valid payroll_id.
- INV-HR-036: Total net pay must equal total gross pay minus total deductions.
- INV-CROSS-003: Event ID is a globally unique UUID v7.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
