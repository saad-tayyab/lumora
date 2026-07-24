---
id: CON-FIN-009
name: Debit
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

# Debit

## Definition

An entry on the left side of a T account. Debits increase asset, expense, and drawing accounts and decrease liability, owner's equity, and revenue accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| side | string | Always the left side of the account |
| effect_on_assets | string | Increases assets |
| effect_on_liabilities | string | Decreases liabilities |
| effect_on_equity | string | Decreases equity (except via expenses/drawings) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
