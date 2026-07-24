---
id: CON-FIN-593
name: Premium (Bonds)
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Premium (Bonds)

## Definition

The excess of the issue price of bonds over their face amount; the excess of the issue price of stock over its par value.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| issue_price | Money | Price at which security was issued |
| face_amount | Money | Par or face value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
