---
id: CON-FIN-581
name: Investment Turnover
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

# Investment Turnover

## Definition

A financial ratio that measures how efficiently a company uses its assets to generate revenue. Calculated as Sales divided by Invested Assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales | decimal | Total revenue from sales |
| invested_assets | decimal | Total assets invested |
| turnover_ratio | decimal | The resulting turnover ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
