---
id: CON-FIN-013
name: General Ledger
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# General Ledger

## Definition

The book of final entry where journal entries are posted to individual accounts, providing the balances for each account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts | list | All accounts of the business |
| account_balances | map | Current balance of each account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
