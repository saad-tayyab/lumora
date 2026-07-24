---
id: CON-FIN-374
name: Indirect Cost
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Indirect Cost

## Definition

A cost that cannot be easily and conveniently traced to a specified cost object. Also known as overhead or common cost.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| traceability | string | Cannot be easily traced to cost object |
| allocation_method | string | Allocated using activity bases |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
