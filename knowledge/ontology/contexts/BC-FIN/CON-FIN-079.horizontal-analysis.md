---
id: CON-FIN-079
name: Horizontal Analysis
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

# Horizontal Analysis

## Definition

A technique for evaluating financial statement data over a period of time by comparing current period amounts with the same items on an earlier statement, computing the increase or decrease in amount and percentage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| base_period | date_range | Earlier period used as base |
| current_period | date_range | Current period being compared |
| amount_change | money | Dollar change |
| percent_change | percentage | Percentage change |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
