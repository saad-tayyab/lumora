---
id: CON-FIN-192
name: Retail Inventory Method
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

# Retail Inventory Method

## Definition

A method of estimating inventory cost by converting ending inventory at retail to cost using a cost-to-retail ratio. The ratio equals Cost of Goods Available for Sale divided by Retail Price of Goods Available for Sale.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_to_retail_ratio | string | Cost of Goods Available for Sale / Retail Price of Goods Available for Sale |
| ending_inventory_retail | string | Beginning Inventory at Retail + Purchases at Retail - Sales |
| ending_inventory_cost | string | Ending Inventory at Retail x Cost-to-Retail Ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
