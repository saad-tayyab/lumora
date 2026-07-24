---
id: CON-FIN-075
name: Business Entity Assumption
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

# Business Entity Assumption

## Definition

The activities of the entity must be kept separate and distinct from the activities of its owner and all other economic entities. Financial records are maintained for the business, not for the owner personally.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| scope | string | Business transactions are recorded separately from personal transactions |
| entities | list | Each economic entity is treated as a separate unit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
