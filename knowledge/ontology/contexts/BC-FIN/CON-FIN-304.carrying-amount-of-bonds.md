---
id: CON-FIN-304
name: Carrying Amount of Bonds
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

# Carrying Amount of Bonds

## Definition

The net book value of bonds payable, calculated as face value plus unamortized premium or minus unamortized discount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of the bonds |
| unamortized_premium | numeric | Remaining premium not yet amortized |
| unamortized_discount | numeric | Remaining discount not yet amortized |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
