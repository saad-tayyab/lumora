---
id: CON-FIN-351
name: Reconciliation Schedule
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

# Reconciliation Schedule

## Definition

A supplementary schedule included with the direct method that reconciles net income to net cash flows from operating activities, similar to the operating activities section prepared under the indirect method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| net_income | decimal | Starting point for reconciliation |
| adjustments | array | Noncash items and working capital changes |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
