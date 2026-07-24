---
id: CON-FIN-389
name: Product Cost Distortion
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Product Cost Distortion

## Definition

The misstatement of product costs that occurs when overhead is allocated using an inappropriate method, causing some products to be overcosted and others undercosted.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| overcosted_products | array | Products receiving more overhead than they actually consume |
| undercosted_products | array | Products receiving less overhead than they actually consume |
| cause | string | Root cause of distortion (e.g., using volume-based allocation for non-volume activities) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
