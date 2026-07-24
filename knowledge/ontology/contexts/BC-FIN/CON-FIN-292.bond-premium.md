---
id: CON-FIN-292
name: Bond Premium
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

# Bond Premium

## Definition

The difference between the selling price of a bond and its face value when the contract rate exceeds the market rate, representing a reduction in interest cost to the issuer over the life of the bond.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of the bond |
| selling_price | numeric | The cash proceeds received from bond issuance |
| premium_amount | numeric | Selling price minus face value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
