---
id: CON-FIN-255
name: Boot
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

# Boot

## Definition

The remaining balance owed on an asset exchange after applying the trade-in allowance. It is either paid in cash or recorded as a liability. Also called the 'tax name' for the cash difference.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Cash paid or liability recorded for the difference |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
