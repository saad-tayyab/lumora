---
id: CON-FIN-119
name: Current Asset
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

# Current Asset

## Definition

Assets that are expected to be converted to cash, sold, or consumed within one year or the operating cycle, whichever is longer.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| description | string | Name of the asset |
| expected_conversion_period | string | When the asset will be converted to cash or consumed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
