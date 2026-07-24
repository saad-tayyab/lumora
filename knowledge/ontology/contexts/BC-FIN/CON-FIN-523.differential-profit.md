---
id: CON-FIN-523
name: Differential Profit
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

# Differential Profit

## Definition

The difference between differential revenue and differential costs, indicating whether a decision is expected to increase or decrease income.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| differential_revenue | decimal | Revenue difference between alternatives |
| differential_cost | decimal | Cost difference between alternatives |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
