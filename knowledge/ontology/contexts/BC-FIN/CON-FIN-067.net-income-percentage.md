---
id: CON-FIN-067
name: Net Income Percentage
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

# Net Income Percentage

## Definition

The ratio of net income to sales, expressed as a percentage. It measures overall profitability after all expenses, including interest and taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | decimal | Bottom-line profit |
| sales | decimal | Net sales revenue |
| formula | string | Net Income / Sales × 100 |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
