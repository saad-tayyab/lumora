---
id: CON-FIN-005
name: Revenue
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

# Revenue

## Definition

Increases in owner's equity resulting from business operations that earn income. Also called fees earned or sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | money | Total revenue earned |
| source | string | Source of revenue (services, sales, etc.) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
