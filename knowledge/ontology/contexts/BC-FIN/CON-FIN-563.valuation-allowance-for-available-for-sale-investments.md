---
id: CON-FIN-563
name: Valuation Allowance for Available-for-Sale Investments
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

# Valuation Allowance for Available-for-Sale Investments

## Definition

A contra/adjunct asset account used to adjust the cost of available-for-sale securities to fair value on the balance sheet. The account accumulates unrealized gains and losses across reporting periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| debit_balance | decimal | Cumulative unrealized gain |
| credit_balance | decimal | Cumulative unrealized loss |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
