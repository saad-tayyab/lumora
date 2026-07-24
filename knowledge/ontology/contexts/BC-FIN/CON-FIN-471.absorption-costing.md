---
id: CON-FIN-471
name: Absorption Costing
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Absorption Costing

## Definition

A costing method that assigns all manufacturing costs (fixed and variable) to products for external financial reporting under GAAP.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| product_costs | array | Direct materials, direct labor, variable overhead, and fixed overhead |
| period_costs | array | Selling and administrative expenses |
| inventory_valuation | string | Includes fixed manufacturing overhead in inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
