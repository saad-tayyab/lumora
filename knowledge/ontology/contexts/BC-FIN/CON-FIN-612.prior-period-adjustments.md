---
id: CON-FIN-612
name: Prior Period Adjustments
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Prior Period Adjustments

## Definition

Corrections of material errors from previous accounting periods that are reported as adjustments to the beginning balance of retained earnings, rather than on the current income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| error_type | String | Nature of the error being corrected |
| period_affected | String | The accounting period in which the error occurred |
| retained_earnings_impact | Money | Adjustment to beginning retained earnings balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
