---
id: CON-FIN-317
name: Loss on Realization
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

# Loss on Realization

## Definition

The excess of book value of noncash assets over the cash proceeds from their sale, allocated as a reduction to partners' capital accounts based on the income-sharing ratio.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_proceeds | numeric | Cash received from asset sale |
| book_value | numeric | Book value of assets sold |
| loss_amount | numeric | The loss amount to be distributed |
| allocated_to_partners | allocation[] | Each partner's share based on income-sharing ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
