---
id: CON-FIN-125
name: Permanent Accounts
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

# Permanent Accounts

## Definition

Balance sheet accounts (assets, liabilities, and owner's equity) whose balances are carried forward to the next accounting period. They are not closed at year-end.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_type | enum | Asset, Liability, or Owner's Equity |
| balance_carryforward | boolean | Balance carries to next period (always true) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
