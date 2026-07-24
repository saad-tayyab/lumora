---
id: CON-FIN-297
name: Loss on Bond Redemption
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

# Loss on Bond Redemption

## Definition

A loss recorded when bonds are redeemed at a price greater than their carrying amount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Redemption price minus carrying amount |
| description | string | Recognized as other expense on the income statement |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
