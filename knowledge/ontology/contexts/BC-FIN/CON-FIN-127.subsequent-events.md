---
id: CON-FIN-127
name: Subsequent Events
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

# Subsequent Events

## Definition

Transactions or events that occur after the fiscal year-end but before financial statements are issued. Events providing evidence of conditions existing at the balance sheet date require adjustment; others only require disclosure.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| type | enum | Adjusting-type or non-adjusting-type |
| adjusting_events | description | Evidence conditions that existed at balance sheet date; require adjustment |
| non_adjusting_events | description | Conditions arising after balance sheet date; require disclosure only |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
