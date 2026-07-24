---
id: CON-FIN-055
name: Fiscal Year
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

# Fiscal Year

## Definition

The accounting period used by a business, which may be a month, quarter, or year.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| period_type | string | Monthly, quarterly, or annually |
| start_date | date | Beginning of the fiscal year |
| end_date | date | End of the fiscal year |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
