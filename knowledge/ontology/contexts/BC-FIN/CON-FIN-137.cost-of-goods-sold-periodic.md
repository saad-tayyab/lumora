---
id: CON-FIN-137
name: Cost of Goods Sold - Periodic
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

# Cost of Goods Sold - Periodic

## Definition

The cost of merchandise sold during the period, computed indirectly under the periodic inventory system using the formula: Beginning Inventory + Net Purchases + Freight In - Ending Inventory = Cost of Goods Sold.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Beginning Inventory + Cost of Inventory Purchased - Ending Inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
