---
id: CON-FIN-442
name: Pull Manufacturing
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Pull Manufacturing

## Definition

A lean manufacturing approach where products are manufactured only as they are ordered by customers, keeping inventory levels low. Contrasts with push manufacturing which uses demand estimates to schedule production.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| production_trigger | string | Customer orders trigger production |
| inventory_level | string | Low inventory levels maintained |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
