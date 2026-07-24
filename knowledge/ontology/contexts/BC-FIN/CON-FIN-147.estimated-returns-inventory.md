---
id: CON-FIN-147
name: Estimated Returns Inventory
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

# Estimated Returns Inventory

## Definition

An asset account representing the estimated cost of merchandise expected to be returned by customers. It is established as an adjusting entry at period end to properly match revenues with expected returns.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_cost | decimal | Estimated cost of merchandise to be returned |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
