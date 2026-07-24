---
id: CON-HR-007
name: Payroll
context: BC-HR
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - payroll
  - core
---

# Payroll

## Definition

An aggregate root representing a payroll processing run for a specific period. Encapsulates the calculation of salaries, deductions, taxes, and net pay for all employees in the payroll cycle. Produces payslips for each employee included in the run.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| period_start | date | yes | Payroll period start date |
| period_end | date | yes | Payroll period end date |
| status | enum | yes | Draft, Processing, Completed, Failed |
| total_gross_pay | decimal | yes | Sum of all gross pay amounts |
| total_deductions | decimal | yes | Sum of all deductions |
| total_net_pay | decimal | yes | Sum of all net pay amounts |
| processed_by | UUID | yes | Reference to Employee who initiated |
| processed_at | timestamp | no | Date/time of processing |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-008 (Payslip) | has-many | 1:N | Payroll run produces many payslips |
| CON-HR-001 (Employee) | uses | N:1 | Processed by an employee |

## Invariants

- INV-HR-019: Period end must be after period start.
- INV-HR-020: Total net pay = Total gross pay - Total deductions.
- INV-HR-021: A payroll cannot be modified once status is Completed.
- INV-HR-022: No two payroll runs can overlap for the same period.

## Business Rules

- All monetary values use decimal arithmetic (INV-FIN-004).
- All monetary calculations are traceable (INV-FIN-003).

## Events

- PayrollProcessed (CON-HR-013)

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
