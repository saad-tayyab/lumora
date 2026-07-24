---
id: CON-FIN-124
name: Closing Entries
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

# Closing Entries

## Definition

Journal entries made at the end of an accounting period to transfer the balances of temporary accounts (revenue, expense, and drawing) to the owner's capital account, resetting temporary accounts to zero for the next period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue_closing | debit | Debit each revenue account for its balance; credit Income Summary |
| expense_closing | credit | Debit Income Summary; credit each expense account for its balance |
| income_summary_closing | transfer | Debit Income Summary for net income (or credit for net loss); transfer to owner's capital |
| drawing_closing | debit | Debit owner's capital; credit owner's drawing account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
