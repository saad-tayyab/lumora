---
id: CON-FIN-056
name: Chart of Accounts
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

# Chart of Accounts

## Definition

A complete listing of all accounts used by a business, arranged in order of account numbers. The first digit indicates the major classification (1=assets, 2=liabilities, 3=equity, 4=revenue, 5=expenses), the second digit indicates subclassification, and the third digit identifies the specific account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_number | string | Three-digit code identifying each account |
| major_classification | string | First digit indicating account type |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
