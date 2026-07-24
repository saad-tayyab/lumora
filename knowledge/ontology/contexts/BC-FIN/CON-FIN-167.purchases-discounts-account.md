---
id: CON-FIN-167
name: Purchases Discounts Account
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

# Purchases Discounts Account

## Definition

A contra-purchases account in the periodic inventory system that records discounts taken for early payment of merchandise purchases. It has a credit normal balance and reduces the cost of merchandise purchased.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Discount amount for early payment |
| normal_balance | string | Credit normal balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
