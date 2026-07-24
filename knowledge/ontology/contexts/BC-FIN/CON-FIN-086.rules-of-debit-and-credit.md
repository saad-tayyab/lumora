---
id: CON-FIN-086
name: Rules of Debit and Credit
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Rules of Debit and Credit

## Definition

The systematic rules governing which side (debit or credit) records increases and decreases for each type of account. Assets and expenses increase with debits; liabilities, equity, and revenue increase with credits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| asset_accounts | string | Debit for increases, Credit for decreases |
| liability_accounts | string | Credit for increases, Debit for decreases |
| equity_accounts | string | Credit for increases, Debit for decreases |
| revenue_accounts | string | Credit for increases, Debit for decreases |
| expense_accounts | string | Debit for increases, Credit for decreases |
| drawing_accounts | string | Debit for increases, Credit for decreases |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
