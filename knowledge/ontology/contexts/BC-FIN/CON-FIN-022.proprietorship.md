---
id: CON-FIN-022
name: Proprietorship
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

# Proprietorship

## Definition

A business owned by one person, where the owner has unlimited personal liability for the business's debts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| owner | string | Name of the single owner |
| capital_account | string | Owner's capital account |
| drawing_account | string | Owner's drawing account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
