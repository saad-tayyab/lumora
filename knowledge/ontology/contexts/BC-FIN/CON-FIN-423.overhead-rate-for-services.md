---
id: CON-FIN-423
name: Overhead Rate for Services
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

# Overhead Rate for Services

## Definition

A rate used to allocate overhead costs to service jobs, often based on direct labor hours or direct labor cost.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Overhead Rate = Estimated Total Overhead / Estimated Activity Base |
| common_bases | string | Direct labor hours, direct labor cost, media purchases (advertising) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
