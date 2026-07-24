---
id: CON-FIN-204
name: Cash Short and Over Account
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

# Cash Short and Over Account

## Definition

An account used to record differences between actual cash on hand and the amount recorded in the accounting system. A debit balance represents a shortage (expense); a credit balance represents an overage (other revenue).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| shortage | string | Debit balance recorded as miscellaneous expense |
| overage | string | Credit balance recorded as other revenue |
| detection_purpose | string | Identifies errors in making change or recording cash sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
