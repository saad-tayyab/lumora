---
id: CON-FIN-544
name: Capital Rationing
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Capital Rationing

## Definition

The process by which management allocates available investment funds among competing capital investment proposals when funds are limited.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| available_funds | decimal | Total capital budget available for investment |
| proposals_screened | integer | Number of proposals passing minimum standards |
| funded_proposals | integer | Number of proposals selected for funding |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
