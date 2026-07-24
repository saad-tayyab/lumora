---
id: CON-FIN-268
name: Federal Unemployment Tax (FUTA)
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

# Federal Unemployment Tax (FUTA)

## Definition

An employer-only tax that provides for temporary payments to those who become unemployed. Collected by the federal government and allocated to states.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| tax_rate | decimal | Rate applied to employer's payroll |
| max_earnings | decimal | Maximum earnings subject to FUTA |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
