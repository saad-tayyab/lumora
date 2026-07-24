---
id: CON-FIN-049
name: Deferred Expense
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Deferred Expense

## Definition

Cash paid before an expense is incurred, creating an asset that is expensed over time as it is used.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Cash paid in advance |
| debit_account | string | Prepaid Expense (asset) |
| credit_account | string | Cash |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
