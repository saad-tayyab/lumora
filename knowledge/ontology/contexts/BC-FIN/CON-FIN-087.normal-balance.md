---
id: CON-FIN-087
name: Normal Balance
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

# Normal Balance

## Definition

The side of an account (debit or credit) that receives increases. The normal balance indicates the expected side for positive balances.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| side | enum | debit or credit — the side that increases the account |
| account_type | enum | The type of account determining the normal balance side |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
