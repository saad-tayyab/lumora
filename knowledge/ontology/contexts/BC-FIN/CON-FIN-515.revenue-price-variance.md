---
id: CON-FIN-515
name: Revenue Price Variance
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

# Revenue Price Variance

## Definition

The difference between the planned selling price per unit and the actual selling price per unit, multiplied by the actual units sold, measuring the impact of selling price changes on revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| planned_price | decimal | Planned selling price per unit |
| actual_price | decimal | Actual selling price per unit |
| actual_units_sold | integer | Actual number of units sold |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
