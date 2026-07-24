---
id: CON-FIN-182
name: Net Realizable Value
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

# Net Realizable Value

## Definition

The estimated selling price of inventory less the direct costs of disposal (such as selling expenses, commissions, or special advertising). This is the 'market' value used in the lower of cost or market method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_selling_price | decimal | Expected selling price of inventory |
| direct_costs_of_disposal | decimal | Selling expenses and commissions |
| net_realizable_value | decimal | Selling price minus disposal costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
