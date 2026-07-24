---
id: CON-FIN-316
name: Gain on Realization
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

# Gain on Realization

## Definition

The excess of cash proceeds from selling noncash assets over their book value, allocated as an increase to partners' capital accounts based on the income-sharing ratio.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_proceeds | numeric | Cash received from asset sale |
| book_value | numeric | Book value of assets sold |
| gain_amount | numeric | The gain amount to be distributed |
| allocated_to_partners | allocation[] | Each partner's share based on income-sharing ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
