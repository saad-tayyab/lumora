---
id: CON-FIN-077
name: Owner's Drawing
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

# Owner's Drawing

## Definition

Withdrawals of cash or other assets by the owner for personal use. Reduces owner's equity. Not an expense.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | money | Amount withdrawn by owner |
| date | date | Date of withdrawal |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
