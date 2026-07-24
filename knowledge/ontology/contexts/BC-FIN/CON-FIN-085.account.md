---
id: CON-FIN-085
name: Account
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

# Account

## Definition

An individual recordkeeping device used to record increases and decreases in a specific asset, liability, owner's equity, revenue, or expense. In its simplest form (T account), it has three parts: a title, a debit (left) side, and a credit (right) side.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| title | string | The name of the accounting element recorded in the account |
| debit_side | money | Left side for recording debits |
| credit_side | money | Right side for recording credits |
| balance | money | The excess of debits over credits or credits over debits |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
