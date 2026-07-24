---
id: CON-FIN-290
name: Callable Bond
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

# Callable Bond

## Definition

A bond that may be redeemed (paid off) by the issuing company prior to the maturity date.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| call_price | decimal | The price at which the bond can be redeemed |
| call_date | date | Date after which the bond can be called |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
