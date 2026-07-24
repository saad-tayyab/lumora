---
id: CON-FIN-464
name: Break-Even Point
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

# Break-Even Point

## Definition

The level of operations (in units or dollars) at which total revenues equal total costs, resulting in zero operating income. Computed as Fixed Costs ÷ Unit Contribution Margin.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| units | integer | Break-even quantity in units |
| dollars | decimal | Break-even sales in dollars |
| formula | string | Fixed Costs / Unit Contribution Margin |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
