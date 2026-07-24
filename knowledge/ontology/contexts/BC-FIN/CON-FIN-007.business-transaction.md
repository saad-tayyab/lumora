---
id: CON-FIN-007
name: Business Transaction
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Business Transaction

## Definition

An event that has a financial impact on the accounting equation elements of a business and can be reliably measured.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | Date of the transaction |
| description | string | Narrative of the event |
| accounts_affected | list | Accounts impacted by the transaction |
| amount | Money | Financial amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
