---
id: CON-FIN-006
name: Expense
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

# Expense

## Definition

A decrease in owner's equity resulting from costs incurred in the process of earning revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Expense account name |
| amount | Money | Amount incurred |
| normal_balance | string | Debit balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
