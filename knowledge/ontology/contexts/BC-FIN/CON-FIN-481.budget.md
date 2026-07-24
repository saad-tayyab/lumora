---
id: CON-FIN-481
name: Budget
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

# Budget

## Definition

A formal written plan expressing management's plans for a specified future time period, expressed in financial terms. A budget serves both planning and control functions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| time_period | string | The fiscal period the budget covers (e.g., month, quarter, year) |
| responsibility_center | string | The organizational unit the budget is assigned to |
| budget_type | string | Static, flexible, continuous, or other budget type |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
