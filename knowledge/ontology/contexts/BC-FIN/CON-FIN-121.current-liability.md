---
id: CON-FIN-121
name: Current Liability
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Current Liability

## Definition

A debt that will be paid out of current assets and is due within one year or the operating cycle, whichever is longer.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | The amount of the liability |
| due_date | date | The date the liability is due |
| creditor | string | The party to whom the debt is owed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
