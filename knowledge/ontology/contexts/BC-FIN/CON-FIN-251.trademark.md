---
id: CON-FIN-251
name: Trademark
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

# Trademark

## Definition

A name, term, or symbol used to identify a business and its products. Registered for 10 years and renewable. Not amortized; reviewed periodically for impairment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| acquisition_cost | decimal | Cost of registering or purchasing the trademark |
| indefinite_life | boolean | Trademark has indefinite useful life, not amortized |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
