---
id: CON-FIN-037
name: Times Interest Earned Ratio
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

# Times Interest Earned Ratio

## Definition

A solvency ratio: (Income Before Income Tax + Interest Expense) ÷ Interest Expense, measuring ability to meet interest obligations.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| income_before_tax | decimal | Earnings before income tax |
| interest_expense | decimal | Total interest expense for the period |
| ratio | decimal | The computed ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
