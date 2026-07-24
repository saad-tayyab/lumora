---
id: CON-FIN-482
name: Static Budget
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Static Budget

## Definition

A budget that presents expected results for only one level of activity. It does not adjust for changes in actual activity volume, making it less useful for cost control when activity varies from plan.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_level | integer | The single activity level the budget is based on |
| budgeted_costs | map | Expected costs at the planned activity level |
| budgeted_revenue | decimal | Expected revenue at the planned activity level |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
