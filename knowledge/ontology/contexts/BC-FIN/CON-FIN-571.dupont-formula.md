---
id: CON-FIN-571
name: DuPont Formula
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

# DuPont Formula

## Definition

A method that decomposes ROI into two components: profit margin (operating income to sales ratio) and investment turnover (sales to invested assets ratio), allowing analysis of what drives profitability.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| profit_margin | decimal | Ratio of operating income to sales |
| investment_turnover | decimal | Ratio of sales to invested assets |
| roi | decimal | Product of profit margin and investment turnover |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
