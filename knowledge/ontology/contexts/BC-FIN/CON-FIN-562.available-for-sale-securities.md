---
id: CON-FIN-562
name: Available-for-Sale Securities
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

# Available-for-Sale Securities

## Definition

Debt or equity securities not classified as trading or held-to-maturity. Reported at fair value with unrealized gains/losses reported in other comprehensive income (equity) rather than the income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Purchase price of the securities |
| fair_value | decimal | Market value at reporting date |
| unrealized_gain_loss | decimal | Reported in other comprehensive income |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
