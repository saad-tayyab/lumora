---
id: CON-FIN-105
name: Prepaid Expense Adjustment
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

# Prepaid Expense Adjustment

## Definition

An adjusting entry that recognizes the portion of a prepaid asset that has been consumed or expired during the period, moving the amount from the asset account to an expense account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| prepaid_account | string | The asset account being reduced (e.g., Supplies, Prepaid Insurance) |
| expense_account | string | The expense account being increased |
| amount_used | decimal | Portion of the prepaid amount consumed this period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
