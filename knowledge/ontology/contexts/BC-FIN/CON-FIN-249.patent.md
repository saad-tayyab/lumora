---
id: CON-FIN-249
name: Patent
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

# Patent

## Definition

An exclusive right granted by the federal government to produce and sell goods with unique features. Legal life is 20 years. Amortized over estimated useful life using straight-line method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| acquisition_cost | decimal | Cost including legal fees for purchased patents |
| legal_life | integer | 20 years from date of grant |
| useful_life | integer | Estimated useful life, not to exceed legal life |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
