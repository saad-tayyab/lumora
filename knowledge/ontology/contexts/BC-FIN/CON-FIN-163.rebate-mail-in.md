---
id: CON-FIN-163
name: Rebate (Mail-In)
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

# Rebate (Mail-In)

## Definition

A refund provided to customers after purchase, typically requiring them to mail in proof of purchase. The retailer must estimate the dollar value of rebates that will be redeemed.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| instant_rebate | entry | Reduces revenue at time of sale |
| mail_in_rebate | entry | Estimate redemptions, reduce sales, record related liability |
| accounting | string | Similar to future redemption coupons |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
