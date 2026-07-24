---
id: CON-FIN-568
name: Return on Investment
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

# Return on Investment

## Definition

A profitability ratio that measures the efficiency of an investment or compares the profits generated from multiple investments. Calculated as Operating Income divided by Invested Assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_income | decimal | The income generated from normal business operations |
| invested_assets | decimal | The total assets invested in a division or segment |
| percentage | percentage | The resulting ROI expressed as a percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
