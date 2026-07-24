---
id: CON-FIN-438
name: Cost Per Equivalent Unit
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

# Cost Per Equivalent Unit

## Definition

The total cost for a cost category (materials or conversion) divided by the total equivalent units for that category. Used to assign costs to completed units and ending work in process.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_cost | decimal | Total costs to be assigned for the period |
| equivalent_units | decimal | Total equivalent units for the cost category |
| cost_per_unit | decimal | Total cost divided by equivalent units |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
