---
id: CON-FIN-081
name: Business Entity Identification
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

# Business Entity Identification

## Definition

The process of determining which entity (business or personal) should record a given transaction, based on the business entity assumption.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| transaction | string | The transaction to be classified |
| entity | string | The business entity that should record the transaction |
| personal | boolean | Whether the transaction is personal to the owner |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
