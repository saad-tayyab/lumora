---
id: CON-FIN-601
name: Cost Centers
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cost Centers

## Definition

Organizational units where managers are responsible for costs only.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manager | string | Person responsible for the center |
| responsibility | string | Cost control only |
| examples | list | Production departments, service departments |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
