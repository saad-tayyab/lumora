---
id: CON-FIN-483
name: Flexible Budget
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Flexible Budget

## Definition

A budget that presents expected results for several different activity levels. It separates costs into fixed and variable components, allowing the budget to adapt to actual activity volume.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_levels | array | Multiple activity levels for which the budget is prepared |
| variable_cost_per_unit | map | Variable cost rate for each cost category |
| fixed_costs | map | Total fixed costs that remain constant across activity levels |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
