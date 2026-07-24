---
id: CON-FIN-288
name: Serial Bonds
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

# Serial Bonds

## Definition

Bonds that mature in installments over several dates.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| maturity_schedule | string | The schedule of maturity dates and amounts |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
