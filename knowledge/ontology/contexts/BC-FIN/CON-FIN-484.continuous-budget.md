---
id: CON-FIN-484
name: Continuous Budget
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

# Continuous Budget

## Definition

A rolling twelve-month budget that adds a new month at the end of each period as the current month is completed, always maintaining a twelve-month planning horizon.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| horizon_months | integer | Always maintains 12 months of forward-looking budget |
| update_frequency | string | One month is added each time a month expires |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
