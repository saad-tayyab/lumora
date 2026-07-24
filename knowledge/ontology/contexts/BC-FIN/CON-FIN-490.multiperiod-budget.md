---
id: CON-FIN-490
name: Multiperiod Budget
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

# Multiperiod Budget

## Definition

A budget that spans multiple time periods (months, quarters) and considers how budgets for one period affect subsequent periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| period_type | string | Type of period (monthly, quarterly) |
| period_count | number | Number of periods covered |
| cross_period_dependencies | boolean | Whether one period's budget affects another |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
