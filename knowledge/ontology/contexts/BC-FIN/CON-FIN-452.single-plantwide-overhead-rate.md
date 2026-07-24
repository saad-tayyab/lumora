---
id: CON-FIN-452
name: Single Plantwide Overhead Rate
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

# Single Plantwide Overhead Rate

## Definition

A method that uses one predetermined overhead rate to allocate all manufacturing overhead costs to products, typically based on a single allocation base such as direct labor hours.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_overhead | decimal | Total manufacturing overhead cost |
| total_base | decimal | Total allocation base (e.g., direct labor hours) |
| rate | decimal | Single rate per unit of allocation base |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
