---
id: CON-FIN-053
name: Temporary Account
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

# Temporary Account

## Definition

An account whose balance is closed at the end of each accounting period, including all revenue, expense, and owner's drawing accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_name | string | Name of the temporary account |
| account_type | string | Revenue, expense, or drawing |
| balance | decimal | Current balance to be closed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
