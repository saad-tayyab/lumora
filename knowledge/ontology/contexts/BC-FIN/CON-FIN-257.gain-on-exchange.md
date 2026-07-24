---
id: CON-FIN-257
name: Gain on Exchange
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

# Gain on Exchange

## Definition

A gain recognized when the fair market value (trade-in allowance) of the old asset exceeds its book value in an exchange that has commercial substance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| gain_amount | decimal | Trade-in allowance minus book value of old asset |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
