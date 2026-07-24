---
id: CON-FIN-325
name: Cumulative Preferred Stock
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cumulative Preferred Stock

## Definition

Preferred stock on which unpaid dividends accumulate as dividends in arrears. Common dividends cannot be paid until all dividends in arrears on cumulative preferred stock are paid.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| dividends_in_arrears | Money | Total accumulated unpaid preferred dividends |
| annual_dividend | Money | Annual preferred dividend entitlement |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
