---
id: CON-FIN-094
name: Prepaid Expenses
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

# Prepaid Expenses

## Definition

Expenses paid in advance that will benefit future periods. Examples include prepaid insurance and prepaid rent. Recorded as assets initially, then expensed as they are used.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| type | string | Expense paid in advance |
| initial_recording | string | Recorded as an asset |
| subsequent | string | Expensed as used over time |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
