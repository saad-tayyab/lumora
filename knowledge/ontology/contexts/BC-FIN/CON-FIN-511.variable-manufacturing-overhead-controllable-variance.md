---
id: CON-FIN-511
name: Variable Manufacturing Overhead Controllable Variance
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

# Variable Manufacturing Overhead Controllable Variance

## Definition

The difference between actual variable overhead costs and the budgeted variable overhead for the actual level of activity, measuring how well variable overhead spending was controlled.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_variable_overhead | number | Actual variable overhead costs incurred |
| budgeted_variable_overhead | number | Budgeted variable overhead at actual activity level |
| variance_amount | number | Difference between actual and budgeted variable overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
