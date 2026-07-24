---
id: CON-FIN-608
name: Fixed Costs
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

# Fixed Costs

## Definition

Costs that remain the same in total regardless of changes in the level of activity within the relevant range.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_amount | Money | Total fixed cost remains constant |
| cost_per_unit | Money | Decreases as activity increases |
| relevant_range | string | Activity range where costs are valid |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
