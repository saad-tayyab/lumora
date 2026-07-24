---
id: CON-FIN-237
name: Construction in Progress
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

# Construction in Progress

## Definition

An asset account used to accumulate costs during the construction of a fixed asset (e.g., a building). When construction is complete, the costs are reclassified to the appropriate fixed asset account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| costs_accumulated | Money | Total construction costs incurred to date |
| status | String | Active construction; reclassified upon completion |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
