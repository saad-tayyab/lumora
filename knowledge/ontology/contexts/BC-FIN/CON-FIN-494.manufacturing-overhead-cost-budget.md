---
id: CON-FIN-494
name: Manufacturing Overhead Cost Budget
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

# Manufacturing Overhead Cost Budget

## Definition

A budget that estimates total manufacturing overhead costs, including both variable and fixed components.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| variable_overhead_rate | number | Variable overhead cost per direct labor hour |
| budgeted_direct_labor_hours | number | Total direct labor hours for the period |
| fixed_overhead | number | Total fixed manufacturing overhead |
| total_manufacturing_overhead | number | Sum of variable and fixed overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
