---
id: CON-FIN-615
name: Pro Forma Balance Sheet
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

# Pro Forma Balance Sheet

## Definition

A projected balance sheet that shows the expected financial position of a company at a future date based on planned transactions and assumptions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| projected_date | Date | The future date the balance sheet projects to |
| assumptions | String | Key assumptions underlying the projections |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
