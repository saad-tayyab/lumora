---
id: CON-FIN-599
name: Controllable Expenses
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

# Controllable Expenses

## Definition

Expenses that a manager can influence or control through their decisions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manager | string | Manager responsible for the expense |
| amount | Money | Amount of controllable expense |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
