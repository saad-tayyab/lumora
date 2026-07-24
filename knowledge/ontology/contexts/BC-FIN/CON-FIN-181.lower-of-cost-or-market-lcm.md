---
id: CON-FIN-181
name: Lower of Cost or Market (LCM)
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

# Lower of Cost or Market (LCM)

## Definition

A valuation method where inventory is reported at the lower of its historical cost or its current market value (net realizable value). This conservatism principle prevents inventory from being overstated on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Historical cost of inventory |
| market_value | decimal | Net realizable value of inventory |
| valuation | decimal | Lower of cost or market value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
