---
id: CON-FIN-264
name: Payroll
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Payroll

## Definition

The total amount paid to employees for services provided during a period. Includes gross pay, deductions, and employer taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| gross_pay | decimal | Total earnings before deductions |
| net_pay | decimal | Amount paid to employee after deductions (take-home pay) |
| total_deductions | decimal | Sum of all withholdings from gross pay |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
