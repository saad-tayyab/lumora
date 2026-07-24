---
id: CON-FIN-610
name: LIFO (Last-In, First-Out)
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

# LIFO (Last-In, First-Out)

## Definition

An inventory cost flow method assuming the most recently purchased goods are the first ones sold.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_flow | string | Newest costs flow to COGS first |
| ending_inventory | Money | Oldest costs remain in inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
