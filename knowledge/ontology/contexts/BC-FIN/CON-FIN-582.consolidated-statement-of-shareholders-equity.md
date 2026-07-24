---
id: CON-FIN-582
name: Consolidated Statement of Shareholders' Equity
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

# Consolidated Statement of Shareholders' Equity

## Definition

A financial statement showing changes in equity components including common stock, additional paid-in capital, AOCI, and retained earnings over a period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| common_stock | Money | Class A and Class B common stock at stated value |
| capital_in_excess | Money | Amounts received above stated value of common stock |
| aoci | Money | Accumulated other comprehensive income (loss) |
| retained_earnings | Money | Cumulative net income less dividends declared |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
