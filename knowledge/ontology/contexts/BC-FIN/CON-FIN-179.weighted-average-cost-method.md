---
id: CON-FIN-179
name: Weighted Average Cost Method
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Weighted Average Cost Method

## Definition

An inventory cost flow method where the average cost per unit is computed by dividing the total cost of goods available for sale by the total units available for sale. This average cost is applied to both units sold and units in ending inventory.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| average_cost_formula | string | Total Cost of Goods Available for Sale / Total Units Available for Sale |
| applied_to_sales | boolean | Same average cost used for both COGS and ending inventory |
| perpetual_calculation | string | In perpetual system, average is recomputed after each purchase |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
