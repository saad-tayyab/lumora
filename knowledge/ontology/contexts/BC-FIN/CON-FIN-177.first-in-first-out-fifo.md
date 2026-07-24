---
id: CON-FIN-177
name: First-In, First-Out (FIFO)
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# First-In, First-Out (FIFO)

## Definition

An inventory cost flow assumption where the first units purchased are assumed to be the first units sold. Ending inventory consists of the most recently purchased units. Costs are charged against revenue in the order they were incurred.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_flow | string | Oldest costs assigned to cost of goods sold first |
| ending_inventory_basis | string | Ending inventory valued at most recent purchase costs |
| income_effect_rising_prices | string | Results in higher net income during periods of rising prices |
| income_effect_falling_prices | string | Results in lower net income during periods of declining prices |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
