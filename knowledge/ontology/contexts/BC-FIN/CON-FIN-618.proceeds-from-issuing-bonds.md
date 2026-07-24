---
id: CON-FIN-618
name: Proceeds from Issuing Bonds
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

# Proceeds from Issuing Bonds

## Definition

The net cash received from the sale of bonds, which may differ from the face (par) value of the bonds depending on whether they are issued at a discount, premium, or par.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | Money | The nominal or par value of the bonds |
| issue_price | Money | The actual amount received from bond issuance |
| discount_or_premium | Money | Difference between face value and issue price |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
