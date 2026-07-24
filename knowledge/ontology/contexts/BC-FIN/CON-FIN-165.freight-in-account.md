---
id: CON-FIN-165
name: Freight In Account
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

# Freight In Account

## Definition

An account in the periodic inventory system that records transportation costs paid by the buyer when purchasing merchandise FOB shipping point. It is debited for freight charges and increases the cost of merchandise purchased.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Transportation cost paid by buyer |
| normal_balance | string | Debit normal balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
