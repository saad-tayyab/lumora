---
id: CON-FIN-096
name: Account Receivable
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

# Account Receivable

## Definition

An amount owed to the business by a customer for goods or services provided on credit. Recorded as an asset.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | string | Customer owing money |
| amount | money | Amount owed |
| normal_balance | string | Debit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
