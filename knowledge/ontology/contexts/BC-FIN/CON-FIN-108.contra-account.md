---
id: CON-FIN-108
name: Contra Account
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

# Contra Account

## Definition

An account whose balance is opposite to the normal balance of its related account. It is deducted from the related account on the financial statements. Examples include Accumulated Depreciation and Owner's Drawing.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| related_account | string | The account from which this contra account is deducted |
| normal_balance_side | enum | The normal balance side, opposite to the related account |
| purpose | string | Why this contra account exists |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
