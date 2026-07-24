---
id: CON-FIN-450
name: Activity Pool
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

# Activity Pool

## Definition

A grouping of costs related to a specific activity performed in the production or service process.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Name of the activity (e.g., Fabrication, Assembly, Setup) |
| budgeted_cost | decimal | Total budgeted cost for this activity pool |
| activity_base | string | The driver used to measure this activity |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
