---
id: CON-FIN-499
name: Multi-Product Direct Materials Budget
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

# Multi-Product Direct Materials Budget

## Definition

A direct materials purchases budget that accounts for multiple products requiring different types and quantities of raw materials.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| product_mix | array | List of products and their production quantities |
| material_requirements_per_product | object | Material type and quantity required per unit of each product |
| material_costs | object | Cost per unit of each material type |
| total_materials_cost | number | Total cost of all materials to be purchased |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
