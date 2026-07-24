---
id: CON-FIN-021
name: Closing Entry
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

# Closing Entry

## Definition

An entry made at the end of an accounting period to transfer the balances of temporary accounts (revenue, expense, drawing) to the owner's capital account and reset temporary accounts to zero.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | End of period date |
| temporary_accounts | list | Revenue, expense, and drawing accounts to close |
| target_account | string | Owner's Capital account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
