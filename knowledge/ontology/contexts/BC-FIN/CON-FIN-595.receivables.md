---
id: CON-FIN-595
name: Receivables
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

# Receivables

## Definition

All money claims against other entities, including people, business firms, and other organizations.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts_receivable | Money | Amounts owed from credit sales |
| notes_receivable | Money | Written promises to pay |
| other_receivables | Money | Miscellaneous claims |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
