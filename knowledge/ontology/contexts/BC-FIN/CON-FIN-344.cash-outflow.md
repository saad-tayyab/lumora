---
id: CON-FIN-344
name: Cash Outflow
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cash Outflow

## Definition

An activity that causes cash to decrease during a period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_type | enum | Operating, investing, or financing |
| amount | Money | Cash decrease amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
