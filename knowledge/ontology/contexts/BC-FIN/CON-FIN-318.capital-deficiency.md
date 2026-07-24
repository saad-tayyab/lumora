---
id: CON-FIN-318
name: Capital Deficiency
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

# Capital Deficiency

## Definition

A debit balance in a partner's capital account resulting from the partner's share of losses exceeding their capital balance, representing an amount the partner owes to the partnership.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The partner with the deficiency |
| deficiency_amount | numeric | The amount of the debit balance |
| payable_to_partnership | boolean | Whether the partner must pay the deficiency |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
