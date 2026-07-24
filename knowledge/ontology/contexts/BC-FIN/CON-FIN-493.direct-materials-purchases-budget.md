---
id: CON-FIN-493
name: Direct Materials Purchases Budget
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

# Direct Materials Purchases Budget

## Definition

A budget that estimates the quantity and cost of direct materials to be purchased to support production and meet desired inventory levels.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| units_to_produce | number | Units from production budget |
| materials_per_unit | number | Quantity of direct materials required per unit |
| desired_ending_inventory | number | Target direct materials inventory at period end |
| estimated_beginning_inventory | number | Expected direct materials inventory at period start |
| cost_per_unit_of_material | number | Cost per unit of direct material |
| total_cost_of_purchases | number | Total cost of direct materials to be purchased |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
