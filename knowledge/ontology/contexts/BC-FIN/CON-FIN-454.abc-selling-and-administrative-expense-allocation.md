---
id: CON-FIN-454
name: ABC Selling and Administrative Expense Allocation
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

# ABC Selling and Administrative Expense Allocation

## Definition

Using activity-based costing to allocate selling and administrative expenses to products based on their actual consumption of selling/admin activities, providing more accurate product profitability analysis.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_pools | array | Selling/admin activities identified (e.g., order writing, technical support, shipping) |
| activity_bases | array | Drivers for each activity (e.g., number of orders, support hours) |
| accuracy | string | More accurate than sales-based allocation when consumption patterns differ |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
