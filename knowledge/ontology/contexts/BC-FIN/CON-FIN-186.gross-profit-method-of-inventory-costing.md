---
id: CON-FIN-186
name: Gross Profit Method of Inventory Costing
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

# Gross Profit Method of Inventory Costing

## Definition

A method of estimating inventory cost using the estimated gross profit percentage for the period. The estimated cost of goods sold is computed by deducting estimated gross profit from sales, then subtracted from merchandise available for sale to estimate ending inventory.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| gross_profit_percentage | decimal | Estimated gross profit as percentage of sales |
| estimated_cogs | decimal | Sales minus estimated gross profit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
