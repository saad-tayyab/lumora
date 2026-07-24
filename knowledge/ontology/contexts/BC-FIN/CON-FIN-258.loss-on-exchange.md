---
id: CON-FIN-258
name: Loss on Exchange
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

# Loss on Exchange

## Definition

A loss recognized when the fair market value (trade-in allowance) of the old asset is less than its book value in an exchange that has commercial substance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| loss_amount | decimal | Book value of old asset minus trade-in allowance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
