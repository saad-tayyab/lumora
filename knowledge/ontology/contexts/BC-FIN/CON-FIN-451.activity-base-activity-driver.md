---
id: CON-FIN-451
name: Activity Base (Activity Driver)
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

# Activity Base (Activity Driver)

## Definition

A measure of the activity that causes costs to be incurred. Examples include direct labor hours, machine hours, number of setups, number of inspections, and number of engineering change orders.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Name of the activity base |
| unit_of_measure | string | Measurement unit (e.g., dlh, setups, inspections) |
| usage_per_product | array | Activity-base usage quantities for each product |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
