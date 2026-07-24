---
id: CON-FIN-445
name: Yield Ratio
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

# Yield Ratio

## Definition

The ratio of output units to input units, measuring the efficiency of the production process. A higher yield ratio indicates less waste and more efficient production.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| input_units | decimal | Units input into the process |
| output_units | decimal | Units transferred out of the process |
| yield_percentage | decimal | Output divided by input as a percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
