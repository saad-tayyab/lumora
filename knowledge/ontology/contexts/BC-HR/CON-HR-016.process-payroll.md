---
id: CON-HR-016
name: ProcessPayroll
context: BC-HR
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - commands
  - payroll
---

# ProcessPayroll

## Definition

A command representing the intent to process payroll for a specific period. When executed, calculates salaries, deductions, and taxes for all active employees and generates payslips. Emits PayrollProcessed event upon completion.

## Command Payload

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| period_start | date | yes | Payroll period start date |
| period_end | date | yes | Payroll period end date |
| processed_by | UUID | yes | Reference to Employee initiating payroll |

## Execution Flow

1. Validate no overlapping payroll runs exist for the period.
2. Create Payroll aggregate (status: Draft).
3. Gather all active employees.
4. For each employee:
   - Calculate gross pay based on salary and attendance.
   - Calculate tax deductions.
   - Calculate insurance and retirement deductions.
   - Calculate net pay.
   - Generate Payslip.
5. Update Payroll totals.
6. Set Payroll status to Completed.
7. Emit PayrollProcessed event.

## Invariants

- INV-HR-043: Period must not overlap with existing completed payroll.
- INV-HR-044: processed_by must reference an active Employee.
- INV-HR-045: All monetary calculations use decimal arithmetic.

## Business Rules

- BR-001: All monetary values use decimal arithmetic (not float).
- INV-FIN-004: Currency amounts stored with decimal precision.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
