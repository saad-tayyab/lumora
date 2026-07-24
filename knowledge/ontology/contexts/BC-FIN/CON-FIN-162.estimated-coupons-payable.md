---
id: CON-FIN-162
name: Estimated Coupons Payable
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Estimated Coupons Payable

## Definition

A current liability for the estimated value of coupons that will be redeemed by customers in the future.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| reporting | string | Current liability on balance sheet |
| estimation | percentage | Based on estimated redemption rate of issued coupons |
| adjustment | entry | Adjusted at period end for estimated redemptions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
