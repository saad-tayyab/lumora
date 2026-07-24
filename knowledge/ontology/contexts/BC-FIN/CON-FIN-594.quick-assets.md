---
id: CON-FIN-594
name: Quick Assets
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Quick Assets

## Definition

Cash and other current assets that can be easily converted to cash, such as temporary investments and accounts receivable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash | Money | Cash on hand |
| temporary_investments | Money | Short-term marketable securities |
| accounts_receivable | Money | Amounts owed by customers |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
