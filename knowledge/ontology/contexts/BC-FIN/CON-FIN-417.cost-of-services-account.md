---
id: CON-FIN-417
name: Cost of Services Account
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

# Cost of Services Account

## Definition

The account in service businesses analogous to Cost of Goods Sold, where costs of completed service jobs are transferred upon client billing.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| equivalent_to | string | Cost of Goods Sold for service businesses |
| source | string | Transferred from Work in Process |
| timing | string | When service is completed and client is billed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
