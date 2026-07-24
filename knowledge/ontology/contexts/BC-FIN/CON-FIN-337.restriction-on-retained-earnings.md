---
id: CON-FIN-337
name: Restriction on Retained Earnings
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

# Restriction on Retained Earnings

## Definition

A limitation on the use of retained earnings for dividend payments, arising from legal requirements, contractual obligations, or board discretion.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| type | enum | Legal, contractual, or discretionary |
| amount | Money | Amount of retained earnings restricted |
| reason | string | Reason for the restriction |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
