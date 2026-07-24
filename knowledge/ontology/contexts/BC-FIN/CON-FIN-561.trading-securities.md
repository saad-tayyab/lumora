---
id: CON-FIN-561
name: Trading Securities
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

# Trading Securities

## Definition

Debt or equity securities purchased with the intent of selling them in the near term to generate profits from short-term price fluctuations. Reported at fair value with unrealized gains/losses on the income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Purchase price of the securities |
| fair_value | decimal | Market value at reporting date |
| unrealized_gain_loss | decimal | Difference between fair value and cost |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
