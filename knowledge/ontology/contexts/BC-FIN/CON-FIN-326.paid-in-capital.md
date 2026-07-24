---
id: CON-FIN-326
name: Paid-In Capital
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Paid-In Capital

## Definition

The total amount of cash and other assets invested in the corporation by stockholders in exchange for stock. Also called contributed capital.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| common_stock | Money | Par value of issued common stock |
| preferred_stock | Money | Par value of issued preferred stock |
| additional_paid_in_capital | Money | Amount received in excess of par or stated value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
