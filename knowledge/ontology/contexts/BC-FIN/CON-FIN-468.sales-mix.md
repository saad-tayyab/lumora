---
id: CON-FIN-468
name: Sales Mix
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

# Sales Mix

## Definition

The relative proportion of different products sold by a company. When multiple products are sold, the break-even point depends on the sales mix.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| product_proportions | array | Relative sales proportions of each product |
| weighted_average_cm | decimal | Weighted average contribution margin based on sales mix |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
