---
id: CON-FIN-524
name: Sunk Cost
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

# Sunk Cost

## Definition

A cost that has been incurred in the past, cannot be recouped, and is not relevant to future decisions, and therefore should be excluded from differential analysis.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Historical cost already incurred |
| irrelevance | boolean | Always irrelevant to future decisions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
