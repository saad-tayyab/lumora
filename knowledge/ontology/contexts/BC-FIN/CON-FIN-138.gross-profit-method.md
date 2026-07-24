---
id: CON-FIN-138
name: Gross Profit Method
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

# Gross Profit Method

## Definition

A method of estimating ending inventory using the historical gross profit percentage. Ending inventory = Goods Available for Sale - Estimated Cost of Goods Sold. Used when physical count is impractical or inventory is destroyed.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Ending Inventory = Beginning Inventory + Net Purchases - (Sales x (1 - Gross Profit Rate)) |
| use_cases | string | Insurance claims for destroyed inventory, interim financial statements |
| requirement | string | Needs a reliable historical gross profit percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
