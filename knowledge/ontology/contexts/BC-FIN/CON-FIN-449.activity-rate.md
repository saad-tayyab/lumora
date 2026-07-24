---
id: CON-FIN-449
name: Activity Rate
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

# Activity Rate

## Definition

The rate at which activity costs are allocated to products, calculated as Budgeted Activity Cost divided by Total Activity-Base Usage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| budgeted_cost | decimal | Total budgeted cost for the activity |
| total_base_usage | decimal | Total activity-base usage across all products |
| rate_per_unit | decimal | Cost per unit of activity base |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
