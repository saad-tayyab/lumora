---
id: CON-FIN-489
name: Nonmanufacturing Staffing Budget Scenario
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

# Nonmanufacturing Staffing Budget Scenario

## Definition

Applied staffing budget calculations for service businesses including holiday retail staffing, hospital nursing, theme park operations, and hotel housekeeping/restaurant staffing.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_driver | string | The measure driving staffing needs (sales volume, patients, vehicles, occupied rooms) |
| staff_ratio | number | Number of staff per unit of activity |
| period_type | string | Time period for staffing (daily, weekly, seasonal) |
| total_labor_cost | number | Total budgeted labor cost for the staffing scenario |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
