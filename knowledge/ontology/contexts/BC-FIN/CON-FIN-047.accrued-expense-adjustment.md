---
id: CON-FIN-047
name: Accrued Expense Adjustment
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Accrued Expense Adjustment

## Definition

An adjusting entry that records an expense that has been incurred but not yet paid or recorded, creating a liability and recognizing the expense.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| expense_account | string | The expense account being increased |
| liability_account | string | The liability account for amounts owed (e.g., Wages Payable) |
| amount_incurred | decimal | Expense incurred but not yet recorded |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
