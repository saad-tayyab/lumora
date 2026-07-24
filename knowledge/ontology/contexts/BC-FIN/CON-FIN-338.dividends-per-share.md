---
id: CON-FIN-338
name: Dividends Per Share
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

# Dividends Per Share

## Definition

A profitability ratio that measures the extent to which earnings are being distributed to common shareholders, computed as dividends on common stock divided by shares of common stock outstanding.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| dividends_on_common_stock | decimal | Total dividends declared on common stock |
| shares_outstanding | integer | Number of common shares outstanding |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
