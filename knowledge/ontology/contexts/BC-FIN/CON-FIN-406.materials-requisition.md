---
id: CON-FIN-406
name: Materials Requisition
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Materials Requisition

## Definition

A document that authorizes the release of raw materials from the storeroom to the factory floor for use in production. Distinguishes between direct materials (traceable to jobs) and indirect materials (general factory use).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_materials | decimal | Materials directly traceable to specific jobs |
| indirect_materials | decimal | Materials for general factory use, part of manufacturing overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
