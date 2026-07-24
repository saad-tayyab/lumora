---
id: CON-FIN-091
name: Posting
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

# Posting

## Definition

The process of transferring journal entry amounts to the ledger accounts. Each journal entry is posted to the ledger to update account balances.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| source | string | Journal entries |
| destination | string | Ledger accounts |
| process | string | Transferring amounts from journal to ledger |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
