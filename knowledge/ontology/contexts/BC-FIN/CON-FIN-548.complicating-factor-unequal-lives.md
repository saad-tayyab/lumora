---
id: CON-FIN-548
name: Complicating Factor — Unequal Lives
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

# Complicating Factor — Unequal Lives

## Definition

Capital investment proposals with different useful lives are not directly comparable using NPV unless the analysis period is equalized, typically by assuming sale of the longer-lived asset.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| proposal_a_life | integer | Useful life of first proposal |
| proposal_b_life | integer | Useful life of second proposal |
| equalization_method | string | Method to equalize lives (e.g., estimate residual value at common endpoint) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
