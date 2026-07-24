---
id: CON-FIN-178
name: Last-In, First-Out (LIFO)
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

# Last-In, First-Out (LIFO)

## Definition

An inventory cost flow assumption where the last units purchased are assumed to be the first units sold. Ending inventory consists of the earliest purchased units. Most recent costs are matched against revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_flow | string | Most recent costs assigned to cost of goods sold first |
| ending_inventory_basis | string | Ending inventory valued at oldest purchase costs |
| income_effect_rising_prices | string | Results in lower net income during periods of rising prices |
| tax_advantage | string | Management may prefer LIFO in rising prices to reduce income tax expense |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
