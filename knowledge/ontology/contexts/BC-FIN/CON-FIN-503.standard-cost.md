---
id: CON-FIN-503
name: Standard Cost
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

# Standard Cost

## Definition

A predetermined cost for manufacturing a single unit of product, consisting of a standard price multiplied by a standard quantity for each cost element (direct materials, direct labor, manufacturing overhead).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| standard_price | number | Expected price per unit of input (e.g., per sq. yd., per hour) |
| standard_quantity | number | Expected quantity of input per unit of output |
| standard_cost_per_unit | number | Standard price × Standard quantity |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
