---
id: CON-FIN-583
name: Sales-Related Reserves
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

# Sales-Related Reserves

## Definition

Variable consideration estimates recorded as reductions to revenue at the time of sale for anticipated returns, discounts, and miscellaneous claims from customers.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales_returns | Money | Estimated product returns from customers including contractual and discretionary returns |
| sales_discounts | Money | Post-invoice discounts expected to be granted |
| miscellaneous_claims | Money | Other customer claims reducing net revenue |
| estimated_cost_of_returns | Money | Inventory cost for estimated product returns, recorded in prepaid assets |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
