---
id: CON-FIN-010
name: Credit
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

# Credit

## Definition

An entry on the right side of a T account. Credits decrease asset, expense, and drawing accounts and increase liability, owner's equity, and revenue accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| side | string | Always the right side of the account |
| effect_on_assets | string | Decreases assets |
| effect_on_liabilities | string | Increases liabilities |
| effect_on_equity | string | Increases equity (via revenue) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
