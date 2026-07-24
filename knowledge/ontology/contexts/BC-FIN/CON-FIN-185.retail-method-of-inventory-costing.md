---
id: CON-FIN-185
name: Retail Method of Inventory Costing
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

# Retail Method of Inventory Costing

## Definition

A method of estimating inventory cost that requires costs and retail prices to be maintained for merchandise available for sale. A cost-to-retail ratio is used to convert ending inventory at retail to estimated ending inventory cost.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_to_retail_ratio | decimal | Ratio of cost to retail price of merchandise available for sale |
| ending_inventory_at_retail | decimal | Merchandise available for sale at retail minus sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
