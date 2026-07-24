---
id: CON-FIN-516
name: Revenue Volume Variance
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

# Revenue Volume Variance

## Definition

The difference between the planned units sold and the actual units sold, multiplied by the planned sales price, measuring the impact of sales volume changes on revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| planned_units | integer | Planned number of units to be sold |
| actual_units | integer | Actual number of units sold |
| planned_price | decimal | Planned selling price per unit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
