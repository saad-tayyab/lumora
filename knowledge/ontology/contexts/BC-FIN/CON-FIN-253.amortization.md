---
id: CON-FIN-253
name: Amortization
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

# Amortization

## Definition

The process of allocating the cost of an intangible asset to expense over its useful life. Normally computed using the straight-line method. Recorded by debiting amortization expense and crediting the intangible asset account directly.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| annual_amount | decimal | Amount of cost transferred to expense each period |
| method | string | Typically straight-line method |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
