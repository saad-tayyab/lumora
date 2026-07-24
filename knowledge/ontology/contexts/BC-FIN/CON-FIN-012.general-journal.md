---
id: CON-FIN-012
name: General Journal
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

# General Journal

## Definition

The book of original entry where all transactions are initially recorded in chronological order.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| entries | list | Chronological list of journal entries |
| date | date | Date of each entry |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
