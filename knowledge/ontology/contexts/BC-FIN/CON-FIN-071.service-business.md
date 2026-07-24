---
id: CON-FIN-071
name: Service Business
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

# Service Business

## Definition

A business that provides services to its customers rather than selling products. Examples include law firms, accounting firms, and airlines.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue_source | string | Revenue from services provided |
| inventory | boolean | Does not sell products |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
