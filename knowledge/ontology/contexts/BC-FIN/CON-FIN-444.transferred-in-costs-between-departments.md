---
id: CON-FIN-444
name: Transferred-In Costs Between Departments
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

# Transferred-In Costs Between Departments

## Definition

Costs that move from one department's work in process to the next department's work in process as units are transferred. These costs are treated as a separate cost category in the receiving department.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| from_department | string | Department transferring the costs |
| to_department | string | Department receiving the costs |
| cost_amount | decimal | Total cost transferred between departments |
| units_transferred | integer | Number of units transferred |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
