---
id: CON-FIN-003
name: Liability
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

# Liability

## Definition

An obligation of a business entity to transfer an economic benefit as a result of past transactions or events.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Account name |
| balance | Money | Normal credit balance |
| type | enum | Current or long-term classification |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
