---
id: CON-FIN-602
name: Cost-Volume-Profit Analysis
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cost-Volume-Profit Analysis

## Definition

Analysis of the relationship between costs, sales volume, and profits to determine break-even points and target profits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| fixed_costs | Money | Total fixed costs |
| variable_cost_per_unit | Money | Variable cost per unit |
| selling_price_per_unit | Money | Selling price per unit |
| break_even_units | number | Units needed to break even |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
