---
id: CON-FIN-240
name: Lessee
context: BC-FIN
type: role
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Lessee

## Definition

The party who is granted the right to use an asset under a lease contract and makes periodic lease payments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| entity_name | String | Name of the lessee |
| payment_obligation | Money | Periodic rental payment |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
