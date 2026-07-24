---
id: CON-FIN-250
name: Copyright
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

# Copyright

## Definition

An exclusive right to publish and sell a literary, artistic, or musical composition. Granted by the federal government for 70 years beyond the author's death. Amortized over useful life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| acquisition_cost | decimal | Cost of creating and obtaining the copyright |
| legal_life | string | 70 years beyond author's death |
| useful_life | integer | Estimated useful life for amortization |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
