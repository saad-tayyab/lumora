---
id: CON-FIN-295
name: Bond Redemption
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Bond Redemption

## Definition

The early retirement of bonds before their maturity date, typically by paying the bondholders the call price specified in the bond indenture.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of bonds being redeemed |
| call_price | numeric | The price at which the bonds are redeemed, expressed as a percentage of face value |
| unamortized_premium_or_discount | numeric | The remaining unamortized premium or discount at redemption date |
| gain_or_loss | numeric | The difference between carrying amount and call price |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
