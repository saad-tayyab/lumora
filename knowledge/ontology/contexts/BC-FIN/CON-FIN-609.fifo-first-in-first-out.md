---
id: CON-FIN-609
name: FIFO (First-In, First-Out)
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

# FIFO (First-In, First-Out)

## Definition

An inventory cost flow method assuming the earliest goods purchased are the first ones sold.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_flow | string | Oldest costs flow to COGS first |
| ending_inventory | Money | Most recent costs remain in inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
