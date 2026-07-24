---
id: CON-FIN-282
name: Payroll Register
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Payroll Register

## Definition

A chronological record of each payroll period showing employee earnings, deductions, and net pay for all employees.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| employee_name | string | Name of the employee |
| total_hours | decimal | Total hours worked in the period |
| regular_earnings | decimal | Earnings at regular rate |
| overtime_earnings | decimal | Earnings at overtime premium rate |
| total_earnings | decimal | Sum of regular and overtime earnings |
| social_security_tax | decimal | FICA Social Security withheld |
| medicare_tax | decimal | FICA Medicare withheld |
| federal_income_tax | decimal | Federal income tax withheld |
| total_deductions | decimal | Sum of all withholdings |
| net_pay | decimal | Total earnings minus total deductions |
| check_number | string | Sequential payroll check number |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
