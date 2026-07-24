---
id: CON-FIN-126
name: Temporary Accounts
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

# Temporary Accounts

## Definition

Income statement accounts (revenues and expenses) plus the owner's drawing account, whose balances are closed (zeroed out) at the end of each accounting period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_type | enum | Revenue, Expense, or Drawing |
| closed_at_period_end | boolean | Always closed to zero (always true) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
