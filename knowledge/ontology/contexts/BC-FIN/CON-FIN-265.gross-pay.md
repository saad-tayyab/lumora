---
id: CON-FIN-265
name: Gross Pay
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Gross Pay

## Definition

The total earnings of an employee for a payroll period, including regular pay, overtime, bonuses, commissions, and other compensation before any deductions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| regular_pay | decimal | Earnings at regular rate |
| overtime_pay | decimal | Earnings at overtime rate |
| bonuses | decimal | Additional compensation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
