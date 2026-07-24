---
id: CON-FIN-183
name: Days' Sales in Inventory
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

# Days' Sales in Inventory

## Definition

A financial ratio measuring the average number of days it takes to acquire, sell, and replace inventory. Computed as Average Inventory divided by Average Daily Cost of Goods Sold. Lower days' sales indicates more efficient inventory management.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Average Inventory / Average Daily Cost of Goods Sold |
| average_daily_cogs | string | Cost of Goods Sold / 365 days |
| interpretation | string | Lower days = more efficient inventory management |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
