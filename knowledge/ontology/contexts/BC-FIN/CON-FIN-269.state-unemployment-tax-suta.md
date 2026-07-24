---
id: CON-FIN-269
name: State Unemployment Tax (SUTA)
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

# State Unemployment Tax (SUTA)

## Definition

An employer-only tax that provides temporary payments to those who become unemployed. Rates and earnings subject to tax vary by state.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| tax_rate | decimal | State-specific rate |
| max_earnings | decimal | Maximum earnings subject to SUTA |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
