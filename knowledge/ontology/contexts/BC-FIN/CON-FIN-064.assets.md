---
id: CON-FIN-064
name: Assets
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

# Assets

## Definition

Resources owned by a business that have future economic value and can be expressed in monetary terms.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash | money | Liquid funds available |
| accounts_receivable | money | Amounts owed by customers |
| supplies | money | Items used in operations |
| land | money | Real property owned |
| equipment | money | Machinery and tools |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
