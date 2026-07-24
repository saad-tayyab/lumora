---
id: CON-FIN-111
name: Buildings
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

# Buildings

## Definition

A fixed asset representing structures used in business operations. Buildings are depreciated over their estimated useful life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Purchase or construction cost |
| useful_life | integer | Estimated useful life in years |
| accumulated_depreciation | string | Related contra asset account name |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
