---
id: CON-FIN-466
name: Cost-Volume-Profit Chart
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

# Cost-Volume-Profit Chart

## Definition

A graphical display of the relationships among sales, variable costs, fixed costs, and profits. Total sales and total costs lines are plotted; the intersection is the break-even point. The area between the lines above break-even represents profit; below represents loss.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales_line | string | Plot of total sales revenue at each volume level |
| total_costs_line | string | Plot of total costs (fixed + variable) at each volume level |
| break_even_intersection | string | Point where sales line crosses total costs line |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
