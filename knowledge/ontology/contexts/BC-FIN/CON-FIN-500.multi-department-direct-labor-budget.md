---
id: CON-FIN-500
name: Multi-Department Direct Labor Budget
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Multi-Department Direct Labor Budget

## Definition

A direct labor cost budget that accounts for multiple production departments with different labor rates and hour requirements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| departments | array | List of departments involved in production |
| labor_hours_per_department | object | Direct labor hours required per department |
| hourly_rate_per_department | object | Hourly wage rate for each department |
| total_labor_cost | number | Total direct labor cost across all departments |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
