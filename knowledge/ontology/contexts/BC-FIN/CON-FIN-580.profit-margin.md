---
id: CON-FIN-580
name: Profit Margin
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

# Profit Margin

## Definition

A financial ratio that measures the percentage of each dollar of revenue that results in net income. Calculated as Operating Income divided by Sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_income | decimal | Income from normal business operations |
| sales | decimal | Total revenue from sales |
| margin_percentage | percentage | The resulting margin expressed as a percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
