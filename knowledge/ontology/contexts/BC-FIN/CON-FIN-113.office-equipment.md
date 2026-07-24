---
id: CON-FIN-113
name: Office Equipment
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

# Office Equipment

## Definition

A fixed asset representing equipment used in administrative or office operations. Depreciated over its useful life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Purchase price |
| useful_life | integer | Estimated useful life |
| accumulated_depreciation | string | Related contra asset account: Accumulated Depreciation—Office Equipment |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
