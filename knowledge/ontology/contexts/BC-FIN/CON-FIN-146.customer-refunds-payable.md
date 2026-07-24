---
id: CON-FIN-146
name: Customer Refunds Payable
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

# Customer Refunds Payable

## Definition

A liability account representing the estimated amount of refunds owed to customers for returned merchandise. It is established as an adjusting entry at period end.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_amount | decimal | Estimated refunds owed to customers |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
