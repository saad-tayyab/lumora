---
id: CON-FIN-039
name: Return on Common Stockholders' Equity
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

# Return on Common Stockholders' Equity

## Definition

A profitability ratio measuring the rate of profits earned on the amount invested by common stockholders, computed as (Net Income - Preferred Dividends) divided by Average Common Stockholders' Equity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | currency | Net income for the period |
| preferred_dividends | currency | Preferred dividends deducted from net income |
| average_common_equity | currency | Average common stockholders' equity |
| percentage | decimal | Return as a percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
