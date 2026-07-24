---
id: CON-FIN-453
name: Multiple Production Department Overhead Rate
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

# Multiple Production Department Overhead Rate

## Definition

A method that uses a separate overhead rate for each production department to allocate manufacturing overhead to products.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| departments | array | List of production departments with individual overhead costs and rates |
| allocation_base | string | Base used per department (e.g., direct labor hours, machine hours) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
