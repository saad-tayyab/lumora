---
id: CON-FIN-279
name: Contingent Liability
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

# Contingent Liability

## Definition

A potential liability that may arise from a past transaction only if certain future events occur, depending on likelihood and measurability.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| description | string | Nature of the potential obligation |
| likelihood | string | Probable, reasonably possible, or remote |
| estimable | boolean | Whether the amount can be reasonably estimated |
| amount | decimal | Estimated amount if determinable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
