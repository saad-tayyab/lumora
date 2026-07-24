---
id: CON-FIN-083
name: Capital Balance Computation
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

# Capital Balance Computation

## Definition

The calculation of ending owner's equity by taking beginning capital, adding investments and net income, and subtracting withdrawals.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_capital | money | Capital at the start of the period |
| additional_investment | money | Owner investments during the period |
| net_income | money | Net income for the period |
| withdrawals | money | Owner withdrawals during the period |
| ending_capital | money | Capital at the end of the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
