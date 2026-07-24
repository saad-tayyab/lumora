---
id: CON-FIN-034
name: Inventory Turnover Ratio
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

# Inventory Turnover Ratio

## Definition

A financial ratio measuring how many times a company's inventory is sold and replaced during a period. Computed as Cost of Goods Sold divided by Average Inventory. Higher ratios indicate more efficient inventory management.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_of_goods_sold | decimal | COGS for the period |
| average_inventory | decimal | Average of beginning and ending inventory |
| turnover_rate | decimal | Number of times inventory is turned over |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
