---
id: CON-FIN-460
name: Fixed Cost
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

# Fixed Cost

## Definition

A cost that remains the same in total dollar amount as the activity base changes. Cost per unit decreases as activity increases and increases as activity decreases.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_cost | decimal | Constant total cost regardless of activity level within relevant range |
| cost_per_unit | decimal | Decreases as activity increases, increases as activity decreases |
| examples | array | Straight-line depreciation, rent, supervisor salaries |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
