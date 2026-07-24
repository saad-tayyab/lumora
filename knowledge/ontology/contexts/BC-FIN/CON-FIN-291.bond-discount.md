---
id: CON-FIN-291
name: Bond Discount
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

# Bond Discount

## Definition

The difference between the face value of a bond and its selling price when the contract rate is less than the market rate, representing additional interest cost to the issuer over the life of the bond.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of the bond |
| selling_price | numeric | The cash proceeds received from bond issuance |
| discount_amount | numeric | Face value minus selling price |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
