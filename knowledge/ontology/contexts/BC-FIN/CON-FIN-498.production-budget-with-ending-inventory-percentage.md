---
id: CON-FIN-498
name: Production Budget with Ending Inventory Percentage
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Production Budget with Ending Inventory Percentage

## Definition

A production budget where desired ending finished goods inventory is calculated as a percentage of the next period's estimated sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_current_sales | number | Estimated sales for the current period |
| next_period_sales | number | Estimated sales for the following period |
| ending_inventory_percentage | number | Percentage of next period's sales to hold as ending inventory |
| beginning_inventory | number | Inventory carried over from prior period |
| units_to_produce | number | Units that must be produced |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
