---
id: CON-FIN-122
name: Long-Term Liability
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

# Long-Term Liability

## Definition

A debt that is due beyond one year from the balance sheet date. Examples include mortgages, long-term notes, and bonds.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | The total debt amount |
| due_date | date | The maturity date beyond one year |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
