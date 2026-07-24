---
id: CON-FIN-296
name: Gain on Bond Redemption
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

# Gain on Bond Redemption

## Definition

A gain recorded when bonds are redeemed at a price less than their carrying amount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Carrying amount minus redemption price |
| description | string | Recognized as other income on the income statement |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
