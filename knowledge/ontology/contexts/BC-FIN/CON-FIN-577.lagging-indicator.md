---
id: CON-FIN-577
name: Lagging Indicator
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

# Lagging Indicator

## Definition

A financial performance metric that reflects past performance. Examples include sales, profits, market share, and gross profit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| metric_name | string | Name of the lagging indicator |
| historical_period | string | The time period this metric reflects |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
