---
id: CON-FIN-161
name: Coupon (Future Redemption)
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Coupon (Future Redemption)

## Definition

A coupon printed on a sales receipt that may be redeemed for future purchases. The retailer must estimate the dollar value of coupons that will be redeemed and record a liability.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recording | entry | Reduce Sales and credit Estimated Coupons Payable at time of sale |
| redemption | entry | Debit Estimated Coupons Payable, credit Cash or reduce Sales when redeemed |
| expiration | entry | If credit balance remains after expiration, credit back to Sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
