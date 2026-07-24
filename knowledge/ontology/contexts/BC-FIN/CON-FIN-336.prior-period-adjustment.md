---
id: CON-FIN-336
name: Prior Period Adjustment
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

# Prior Period Adjustment

## Definition

A correction of an error in the financial statements of a prior period, reported as an adjustment to the beginning balance of retained earnings.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| error_description | string | Description of the error corrected |
| adjustment_amount | Money | Amount of the correction |
| net_of_tax | Money | Adjustment amount net of tax effect |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
