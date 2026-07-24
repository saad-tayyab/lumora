---
id: CON-FIN-527
name: Total Cost Method
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

# Total Cost Method

## Definition

A cost-plus pricing method where all costs (manufacturing plus selling and administrative) are included in the cost amount, and only desired profit is in the markup.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_basis | string | Total cost per unit including manufacturing and selling/admin expenses |
| markup_includes | string | Only desired profit |
| markup_percentage_formula | string | Desired Profit / Total Cost |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
