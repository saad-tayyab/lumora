---
id: CON-FIN-457
name: Engineering Change Order (ECO)
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

# Engineering Change Order (ECO)

## Definition

A formal document authorizing a change to a product's design or manufacturing process, used as an activity base for engineering change costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| product | string | Product affected by the change |
| description | string | Description of the engineering change |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
