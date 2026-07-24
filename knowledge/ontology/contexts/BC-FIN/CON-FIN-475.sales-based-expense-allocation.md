---
id: CON-FIN-475
name: Sales-Based Expense Allocation
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

# Sales-Based Expense Allocation

## Definition

Method of allocating selling and administrative expenses to products based on their relative sales dollars. May not accurately reflect actual activity consumption.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| allocation_method | string | Based on relative sales dollars |
| limitation | string | Products may consume activities differently than their sales proportions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
