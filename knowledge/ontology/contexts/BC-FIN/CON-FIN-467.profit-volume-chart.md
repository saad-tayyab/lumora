---
id: CON-FIN-467
name: Profit-Volume Chart
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

# Profit-Volume Chart

## Definition

A graphical representation showing the relationship between profit (or loss) and sales volume. The chart plots operating profit/loss on the vertical axis against units or dollars of sales on the horizontal axis, with the break-even point where the line crosses zero.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| x_axis | string | Sales volume in units or dollars |
| y_axis | string | Operating profit or loss |
| slope | string | The slope equals the unit contribution margin |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
