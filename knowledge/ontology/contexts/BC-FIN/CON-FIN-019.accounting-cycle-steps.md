---
id: CON-FIN-019
name: Accounting Cycle Steps
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

# Accounting Cycle Steps

## Definition

The ordered sequence of accounting procedures performed during each accounting period: analyze transactions, journalize, post, prepare unadjusted trial balance, assemble adjustments, prepare adjusted trial balance, prepare financial statements, journalize and post closing entries, prepare post-closing trial balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| step_count | integer | Number of steps in the cycle |
| sequential | boolean | Steps must be performed in order |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
