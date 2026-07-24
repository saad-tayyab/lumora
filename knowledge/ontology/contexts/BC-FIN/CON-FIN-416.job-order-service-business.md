---
id: CON-FIN-416
name: Job Order Service Business
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

# Job Order Service Business

## Definition

A service business that uses job order costing to accumulate costs for each consulting project or service engagement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| primary_costs | string | Direct labor and overhead |
| cost_accounts | string | Work in Process and Cost of Services |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
