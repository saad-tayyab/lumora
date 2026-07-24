---
id: CON-FIN-115
name: Vertical Analysis
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

# Vertical Analysis

## Definition

A percentage analysis of the relationship of each component in a financial statement to a total within the same statement. In the balance sheet, each item is stated as a percent of total assets (or total liabilities and equity). In the income statement, each item is stated as a percent of sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| base_amount | decimal | The total used as the denominator (total assets for balance sheet, sales for income statement) |
| component_amount | decimal | The individual item being expressed as a percentage |
| percentage | decimal | Component amount divided by base amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
