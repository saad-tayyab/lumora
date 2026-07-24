---
id: CON-FIN-376
name: Prime Costs
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

# Prime Costs

## Definition

The sum of direct materials and direct labor costs. These are the primary manufacturing costs directly traceable to products.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_materials | Money | Cost of raw materials directly traceable to the product |
| direct_labor | Money | Cost of labor directly involved in production |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
