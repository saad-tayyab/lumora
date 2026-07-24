---
id: CON-FIN-213
name: Days' Cash on Hand
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

# Days' Cash on Hand

## Definition

A liquidity ratio measuring how many days a company can continue to pay its operating expenses with available cash, calculated as (Cash + Short-term Investments) divided by (Operating Expenses minus Non-cash items) divided by 365.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_and_investments | Money | Cash, equivalents, and short-term investments |
| daily_cash_operating_expenses | Money | Annual operating expenses excluding depreciation divided by 365 |
| days | Float | Number of days cash on hand |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
