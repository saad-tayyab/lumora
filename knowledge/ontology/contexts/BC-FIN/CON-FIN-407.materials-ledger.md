---
id: CON-FIN-407
name: Materials Ledger
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

# Materials Ledger

## Definition

The subsidiary ledger for the Materials inventory account, maintaining individual records for each type of material.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| controls | string | Materials inventory control account |
| detail | string | Individual records per material type |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
