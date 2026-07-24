---
id: CON-FIN-588
name: Earnings Per Share (EPS) on Common Stock
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

# Earnings Per Share (EPS) on Common Stock

## Definition

The profitability ratio that measures the share of profits earned by a share of common stock, computed as net income less preferred dividends divided by the shares of common stock outstanding.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | decimal | Net income for the period |
| preferred_dividends | decimal | Dividends on preferred stock |
| common_shares_outstanding | integer | Average number of common shares outstanding |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
