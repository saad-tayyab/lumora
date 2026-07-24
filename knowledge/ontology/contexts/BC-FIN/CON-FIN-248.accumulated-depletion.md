---
id: CON-FIN-248
name: Accumulated Depletion
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Accumulated Depletion

## Definition

A contra asset account that tracks total depletion recorded on a natural resource since acquisition. Reported as a deduction from the cost of the natural resource on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| balance | decimal | Total depletion accumulated to date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
