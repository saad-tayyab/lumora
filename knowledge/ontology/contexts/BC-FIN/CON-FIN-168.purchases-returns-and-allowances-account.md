---
id: CON-FIN-168
name: Purchases Returns and Allowances Account
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

# Purchases Returns and Allowances Account

## Definition

A contra-purchases account in the periodic inventory system that records the cost of merchandise returned to vendors or allowances received for defective merchandise. It has a credit normal balance and reduces the cost of merchandise purchased.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Cost of returned merchandise or allowances |
| normal_balance | string | Credit normal balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
