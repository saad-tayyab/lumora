---
id: CON-FIN-048
name: Deferred Revenue
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

# Deferred Revenue

## Definition

Cash received before revenue is earned, creating a liability until the revenue is earned through performance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Cash received in advance |
| debit_account | string | Cash |
| credit_account | string | Unearned Revenue (liability) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
