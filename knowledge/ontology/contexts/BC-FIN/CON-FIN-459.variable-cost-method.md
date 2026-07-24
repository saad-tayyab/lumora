---
id: CON-FIN-459
name: Variable Cost Method
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

# Variable Cost Method

## Definition

A cost-plus pricing method that sets the selling price by adding a markup to the variable cost per unit, used when fixed costs are already covered by other products.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| variable_cost_per_unit | decimal | Variable manufacturing and selling costs per unit |
| markup_percentage | decimal | Markup percentage applied to variable cost |
| selling_price | decimal | Selling price per unit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
