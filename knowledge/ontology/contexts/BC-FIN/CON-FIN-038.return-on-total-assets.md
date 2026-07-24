---
id: CON-FIN-038
name: Return on Total Assets
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

# Return on Total Assets

## Definition

A profitability ratio measuring the profitability of total assets without considering how they are financed, computed as (Net Income + Interest Expense) divided by Average Total Assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | currency | Net income for the period |
| interest_expense | currency | Interest expense added back to eliminate financing effects |
| average_total_assets | currency | Average total assets including long-term investments |
| percentage | decimal | Return as a percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
