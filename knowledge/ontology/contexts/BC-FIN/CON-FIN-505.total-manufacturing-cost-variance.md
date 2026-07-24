---
id: CON-FIN-505
name: Total Manufacturing Cost Variance
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

# Total Manufacturing Cost Variance

## Definition

The sum of all manufacturing cost variances including direct materials, direct labor, and manufacturing overhead variances, representing the total deviation from standard manufacturing costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| materials_variance | decimal | Total direct materials cost variance |
| labor_variance | decimal | Total direct labor cost variance |
| overhead_variance | decimal | Total manufacturing overhead cost variance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
