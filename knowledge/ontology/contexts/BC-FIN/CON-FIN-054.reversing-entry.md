---
id: CON-FIN-054
name: Reversing Entry
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Reversing Entry

## Definition

An optional entry made at the beginning of a new accounting period to reverse certain adjusting entries made at the end of the previous period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | First day of new period |
| reverses | string | The adjusting entry from prior period |
| optional | boolean | Not required but simplifies recording |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
