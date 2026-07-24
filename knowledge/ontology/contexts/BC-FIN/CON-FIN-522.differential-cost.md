---
id: CON-FIN-522
name: Differential Cost
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

# Differential Cost

## Definition

The amount of increase or decrease in cost expected from a course of action as compared to an alternative.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_alternative_1 | decimal | Cost under first alternative |
| cost_alternative_2 | decimal | Cost under second alternative |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
