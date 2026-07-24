---
id: CON-FIN-378
name: Product Costs
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

# Product Costs

## Definition

Costs directly associated with manufacturing or purchasing goods for resale. These costs are inventoried (capitalized) on the balance sheet until the product is sold, at which point they become cost of goods sold on the income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_materials | Money | Raw materials directly traceable to the product |
| direct_labor | Money | Labor directly involved in production |
| manufacturing_overhead | Money | Indirect manufacturing costs allocated to products |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
