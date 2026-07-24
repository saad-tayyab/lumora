---
id: CON-FIN-334
name: Paid-In Capital from Sale of Treasury Stock
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

# Paid-In Capital from Sale of Treasury Stock

## Definition

An equity account that records gains or losses from reselling treasury stock above or below its cost. Cannot have a debit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| credit_balance | Money | Cumulative gain from treasury stock resales above cost |
| normal_balance | string | Credit balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
