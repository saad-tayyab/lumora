---
id: CON-FIN-377
name: Conversion Costs
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

# Conversion Costs

## Definition

The combination of direct labor and manufacturing overhead costs. These costs are typically incurred uniformly throughout the production process and are combined for equivalent unit calculations.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_labor | decimal | Labor costs incurred in the department |
| manufacturing_overhead | decimal | Overhead costs applied to the department |
| total_conversion | decimal | Sum of direct labor and manufacturing overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
