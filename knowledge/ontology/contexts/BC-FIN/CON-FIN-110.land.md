---
id: CON-FIN-110
name: Land
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

# Land

## Definition

A fixed asset representing real property. Land is unique among fixed assets because it is not depreciated, as it has an indefinite useful life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Purchase price of the land |
| location | string | Physical location of the property |
| depreciable | boolean | Always false for land |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
