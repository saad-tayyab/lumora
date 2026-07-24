---
id: CON-FIN-592
name: Physical Inventory
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

# Physical Inventory

## Definition

A detailed listing of merchandise on hand.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| items | list | List of all merchandise counted |
| count_date | date | Date of the physical count |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
