---
id: CON-FIN-002
name: Asset
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

# Asset

## Definition

A resource owned by a business entity that has future economic value and is expected to provide benefit in future periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Account name |
| balance | Money | Normal debit balance |
| type | enum | Current or non-current classification |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
