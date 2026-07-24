---
id: CON-FIN-066
name: Expenses
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

# Expenses

## Definition

Decreases in owner's equity that occur in the process of generating revenue. Cost of doing business.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| wages_expense | money | Cost of employee labor |
| rent_expense | money | Cost of occupied space |
| utilities_expense | money | Cost of utilities |
| supplies_expense | money | Cost of supplies used |
| miscellaneous_expense | money | Small costs not classified elsewhere |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
