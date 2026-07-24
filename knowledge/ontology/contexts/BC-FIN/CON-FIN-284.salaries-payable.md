---
id: CON-FIN-284
name: Salaries Payable
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

# Salaries Payable

## Definition

A liability account representing the net amount owed to employees for work performed but not yet paid.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Net pay owed to employees |
| pay_period | string | The payroll period for which payment is due |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
