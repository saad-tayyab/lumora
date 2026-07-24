---
id: CON-FIN-383
name: Work in Process Inventory
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

# Work in Process Inventory

## Definition

An asset account representing the cost of goods that have entered the production process but are not yet complete. Includes direct materials, direct labor, and applied manufacturing overhead.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| components | string | Direct materials + direct labor + applied overhead for partially completed goods |
| statement | string | Balance Sheet |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
