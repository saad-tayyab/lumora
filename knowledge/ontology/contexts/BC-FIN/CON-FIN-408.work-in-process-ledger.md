---
id: CON-FIN-408
name: Work in Process Ledger
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

# Work in Process Ledger

## Definition

The subsidiary ledger for the Work in Process inventory account, containing individual job cost sheets for all uncompleted jobs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| controls | string | Work in Process control account |
| detail | string | Job cost sheets for incomplete jobs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
