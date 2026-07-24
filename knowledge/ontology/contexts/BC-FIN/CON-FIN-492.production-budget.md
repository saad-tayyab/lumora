---
id: CON-FIN-492
name: Production Budget
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

# Production Budget

## Definition

A budget that determines the number of units to be produced based on estimated sales and desired inventory levels.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_units_sold | number | Units expected to be sold |
| desired_ending_inventory | number | Target finished goods inventory at period end |
| estimated_beginning_inventory | number | Expected finished goods inventory at period start |
| units_to_produce | number | Total units that need to be produced |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
