---
id: CON-FIN-300
name: Bond Carrying Amount (Book Value)
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

# Bond Carrying Amount (Book Value)

## Definition

The net amount at which bonds are reported on the balance sheet: face amount less unamortized discount or plus unamortized premium.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | The nominal amount of the bonds |
| unamortized_discount | decimal | Remaining discount not yet amortized |
| unamortized_premium | decimal | Remaining premium not yet amortized |
| carrying_amount | decimal | Face amount ± unamortized amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
