---
id: CON-FIN-271
name: Vacation Pay
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

# Vacation Pay

## Definition

Employee fringe benefit representing earned but unused vacation time. The estimated cost is accrued as an expense and liability during the period employees earn the benefit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accrued_amount | decimal | Estimated vacation pay liability at period end |
| expensed_amount | decimal | Vacation pay expense for the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
