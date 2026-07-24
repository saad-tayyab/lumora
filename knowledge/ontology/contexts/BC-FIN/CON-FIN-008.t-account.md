---
id: CON-FIN-008
name: T Account
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

# T Account

## Definition

A visual representation of an account in the general ledger, shaped like the letter T, with the account title at the top, debits on the left side, and credits on the right side.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| title | string | Account name |
| debit_side | list | Debit entries on left side |
| credit_side | list | Credit entries on right side |
| balance | Money | Net balance of the account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
