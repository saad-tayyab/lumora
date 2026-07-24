---
id: CON-FIN-315
name: Realization
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

# Realization

## Definition

The conversion of noncash assets into cash through sale, with any gain or loss allocated to partners' capital accounts based on the income-sharing ratio.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| book_value_of_assets | numeric | The total book value of noncash assets sold |
| cash_proceeds | numeric | The cash received from selling the assets |
| gain_or_loss | numeric | Cash proceeds minus book value of assets |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
