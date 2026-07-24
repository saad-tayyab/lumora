---
id: CON-FIN-461
name: Mixed Cost
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

# Mixed Cost

## Definition

A cost that contains both fixed and variable components. The fixed portion remains constant within the relevant range, while the variable portion changes in proportion to activity level.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| fixed_component | decimal | The constant portion of the cost within the relevant range |
| variable_component_per_unit | decimal | The variable portion per unit of activity |
| total_cost | decimal | Computed as fixed_component + (variable_component_per_unit × activity_level) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
