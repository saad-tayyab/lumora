---
id: CON-FIN-011
name: Journal Entry
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

# Journal Entry

## Definition

A recording of a transaction in the journal. Includes the date, accounts to be debited and credited, amounts, and a brief description. Total debits must equal total credits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | Date of the transaction |
| debit_account | string | Account to be debited |
| debit_amount | money | Amount to debit |
| credit_account | string | Account to be credited |
| credit_amount | money | Amount to credit |
| description | string | Brief explanation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
