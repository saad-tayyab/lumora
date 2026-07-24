---
id: CON-FIN-041
name: Price-Earnings (P/E) Ratio
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

# Price-Earnings (P/E) Ratio

## Definition

A profitability ratio that measures a company's future earnings prospects, computed as the market price per share of common stock divided by earnings per share on common stock.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| market_price_per_share | decimal | Market price of common stock at period end |
| earnings_per_share | decimal | EPS on common stock |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
