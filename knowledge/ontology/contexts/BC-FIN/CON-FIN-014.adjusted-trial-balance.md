---
id: CON-FIN-014
name: Adjusted Trial Balance
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

# Adjusted Trial Balance

## Definition

A trial balance prepared after adjusting entries have been posted, used to verify equality of debits and credits before preparing financial statements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts | list | All accounts with adjusted balances |
| total_debits | Money | Sum of all debit balances |
| total_credits | Money | Sum of all credit balances |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
