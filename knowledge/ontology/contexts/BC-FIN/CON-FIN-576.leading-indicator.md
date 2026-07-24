---
id: CON-FIN-576
name: Leading Indicator
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

# Leading Indicator

## Definition

A nonfinancial performance metric that is a predictor of future financial performance. Examples include customer satisfaction, employee training hours, and delivery accuracy.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| metric_name | string | Name of the leading indicator |
| prediction_power | string | What future outcome this predicts |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
