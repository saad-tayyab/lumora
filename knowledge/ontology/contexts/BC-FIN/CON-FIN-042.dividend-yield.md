---
id: CON-FIN-042
name: Dividend Yield
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

# Dividend Yield

## Definition

A profitability ratio that measures the rate of return to common stockholders from cash dividends, computed by dividing the dividends per share of common stock by the market price per share of common stock.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| dividends_per_share | decimal | Dividends per common share |
| market_price_per_share | decimal | Market price of common stock |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
