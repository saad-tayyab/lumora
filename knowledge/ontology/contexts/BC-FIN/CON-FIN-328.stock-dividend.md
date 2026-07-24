---
id: CON-FIN-328
name: Stock Dividend
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Stock Dividend

## Definition

A distribution of additional shares of the corporation's own stock to stockholders, recorded by capitalizing retained earnings at fair market value.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| declaration_date | Date | Date board declares the stock dividend |
| record_date | Date | Date determining which stockholders receive shares |
| payment_date | Date | Date stock certificates are issued |
| percentage | number | Percentage of additional shares to be issued |
| market_price | Money | Fair market value per share on declaration date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
