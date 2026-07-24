---
id: CON-HR-008
name: Payslip
context: BC-HR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - payroll
---

# Payslip

## Definition

An individual pay statement for an employee within a payroll run. Contains the breakdown of gross pay, deductions (taxes, insurance, retirement contributions), and net pay for a specific pay period.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| payroll_id | UUID | yes | Reference to Payroll |
| employee_id | UUID | yes | Reference to Employee |
| gross_pay | decimal | yes | Total earnings before deductions |
| tax_deduction | decimal | yes | Total tax deductions |
| insurance_deduction | decimal | yes | Insurance premium deductions |
| retirement_deduction | decimal | yes | Retirement fund contributions |
| other_deductions | decimal | yes | Any other deductions |
| total_deductions | decimal | yes | Sum of all deductions |
| net_pay | decimal | yes | Amount paid to employee |
| payment_method | enum | yes | BankTransfer, Check, Cash |
| payment_date | date | yes | Date of payment |
| status | enum | yes | Draft, Paid, Voided |
| created_at | timestamp | yes | Record creation time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-007 (Payroll) | belongs-to | N:1 | Payslip belongs to a payroll run |
| CON-HR-001 (Employee) | belongs-to | N:1 | Payslip is for a specific employee |
| CON-HR-009 (Salary) | uses | N:1 | Pay calculated based on salary |

## Invariants

- INV-HR-023: Net pay = Gross pay - Total deductions.
- INV-HR-024: Total deductions = tax + insurance + retirement + other deductions.
- INV-HR-025: Gross pay must be non-negative.
- INV-HR-026: One payslip per employee per payroll run.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
