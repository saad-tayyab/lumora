---
id: CON-FIN-228
name: Number of Days Past Due
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

# Number of Days Past Due

## Definition

The number of days between the due date of an account receivable and the date of analysis. Used to classify receivables in the aging schedule.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| due_date | Date | The date payment was originally due |
| analysis_date | Date | The date the aging is performed |
| days_past_due | Integer | Analysis date minus due date, if positive |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
