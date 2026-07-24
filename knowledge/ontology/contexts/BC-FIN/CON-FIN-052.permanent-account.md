---
id: CON-FIN-052
name: Permanent Account
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

# Permanent Account

## Definition

An account whose balance is carried forward from one accounting period to the next; includes assets, liabilities, and owner's equity accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| types | list | Assets, Liabilities, Owner's Equity |
| balance_carryforward | boolean | Balance carries to next period |
| not_closed | boolean | Not closed at end of period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
