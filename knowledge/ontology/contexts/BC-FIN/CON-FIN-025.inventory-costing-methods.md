---
id: CON-FIN-025
name: Inventory Costing Methods
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

# Inventory Costing Methods

## Definition

Methods used to assign costs to inventory items and cost of goods sold: FIFO (first-in, first-out), LIFO (last-in, first-out), and Weighted Average.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| method | enum | FIFO, LIFO, or Weighted Average |
| fifo_assumption | string | Oldest costs assigned to COGS first |
| lifo_assumption | string | Newest costs assigned to COGS first |
| weighted_average_assumption | string | Average cost per unit used |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
