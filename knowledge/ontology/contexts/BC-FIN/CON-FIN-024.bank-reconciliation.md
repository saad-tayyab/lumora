---
id: CON-FIN-024
name: Bank Reconciliation
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Bank Reconciliation

## Definition

An analysis of the items and amounts creating the difference between the cash balance reported on the bank statement and the balance of the cash account in the ledger. The adjusted balances from both sections must be equal.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| bank_section | string | Begins with bank statement balance, adds deposits in transit, deducts outstanding checks |
| company_section | string | Begins with company records balance, adds unrecorded credit memos, deducts unrecorded debit memos |
| adjusted_balance | string | Both sections must arrive at the same adjusted balance |
| nine_steps | string | Standardized nine-step process for preparation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
