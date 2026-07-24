---
id: CON-FIN-098
name: Omission Error
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

# Omission Error

## Definition

An error where a transaction or account balance is entirely left out of the records or trial balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| omitted_item | string | The transaction or account that was left out |
| amount | decimal | The amount that should have been included |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
