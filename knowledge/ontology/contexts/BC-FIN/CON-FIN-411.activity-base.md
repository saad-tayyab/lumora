---
id: CON-FIN-411
name: Activity Base
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

# Activity Base

## Definition

A measure of activity used to allocate manufacturing overhead costs to products, such as direct labor hours, direct labor cost, or machine hours.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| common_bases | string | Direct labor hours, direct labor cost, machine hours |
| purpose | string | Driver for overhead allocation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
