---
id: CON-FIN-174
name: Debit Memo
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

# Debit Memo

## Definition

A document issued by the buyer to notify the seller that the buyer is debiting (reducing) the amount owed to the seller, typically for returned merchandise or defective goods received.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| invoice_amount | decimal | Amount of merchandise being returned |
| reason | string | Reason for the return or allowance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
