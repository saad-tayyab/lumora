---
id: CON-FIN-088
name: Journal
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

# Journal

## Definition

The book of original entry in which transactions are chronologically recorded. Each journal entry shows the accounts affected, the amounts to be debited and credited, and a brief description of the transaction.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | Date of the transaction |
| accounts | list | Accounts debited and credited |
| amounts | list | Debit and credit amounts |
| description | string | Brief explanation of the transaction |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
