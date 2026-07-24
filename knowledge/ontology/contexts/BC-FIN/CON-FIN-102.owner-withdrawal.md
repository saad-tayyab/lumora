---
id: CON-FIN-102
name: Owner Withdrawal
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

# Owner Withdrawal

## Definition

A distribution of business assets to the owner for personal use, recorded as a debit to the owner's drawing account and a credit to Cash or the asset distributed.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| owner_name | string | Name of the business owner |
| amount | decimal | Value of assets withdrawn |
| asset_type | string | Type of asset withdrawn (cash, supplies, etc.) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
