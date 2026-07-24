---
id: CON-FIN-512
name: Fixed Manufacturing Overhead Volume Variance
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

# Fixed Manufacturing Overhead Volume Variance

## Definition

The difference between budgeted fixed overhead and applied fixed overhead, measuring the impact of producing more or fewer units than the denominator level used to set the fixed overhead rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| budgeted_fixed_overhead | number | Total budgeted fixed manufacturing overhead |
| applied_fixed_overhead | number | Fixed overhead rate × standard hours for actual output |
| variance_amount | number | Difference between budgeted and applied fixed overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
