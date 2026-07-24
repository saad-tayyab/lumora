---
id: CON-FIN-622
name: Product Cost Method (for Pricing)
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

# Product Cost Method (for Pricing)

## Definition

A pricing method that sets the selling price by adding a desired markup to the total product cost (manufacturing cost per unit).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_base | Money | Total product cost per unit |
| markup_percentage | Number | Desired profit margin as a percentage of cost |
| selling_price | Money | Calculated as cost base plus markup |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
