---
id: CON-FIN-623
name: Process or Sell Decision
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Process or Sell Decision

## Definition

A differential analysis that evaluates whether to sell a product at an intermediate stage of production or to process it further before selling.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sell_at_split_off_revenue | Money | Revenue from selling at the intermediate point |
| process_further_revenue | Money | Revenue from selling after additional processing |
| incremental_cost | Money | Additional cost to process further |
| decision | String | Sell or process further based on incremental analysis |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
