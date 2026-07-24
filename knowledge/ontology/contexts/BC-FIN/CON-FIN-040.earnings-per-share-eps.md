---
id: CON-FIN-040
name: Earnings Per Share (EPS)
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

# Earnings Per Share (EPS)

## Definition

The amount of net income earned per share of common stock. Computed as (Net Income - Preferred Dividends) / Average Common Shares Outstanding.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | Money | Net income for the period |
| preferred_dividends | Money | Preferred dividends declared (or cumulative amount) |
| average_common_shares | number | Weighted average common shares outstanding |
| eps_amount | Money | Earnings per share result |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
