---
id: CON-FIN-491
name: Sales Budget Forecasting
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

# Sales Budget Forecasting

## Definition

The process of estimating future sales volume by analyzing historical trends, percentage increases or decreases from actual results, and applying them to future periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| historical_unit_sales | number | Actual unit sales from prior periods |
| percentage_change | number | Expected percentage increase or decrease from prior period |
| budgeted_unit_sales | number | Projected unit sales for the budget period |
| selling_price_per_unit | number | Expected selling price per unit |
| total_sales_revenue | number | Total projected sales revenue |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
