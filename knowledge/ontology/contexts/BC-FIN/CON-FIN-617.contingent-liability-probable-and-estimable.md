---
id: CON-FIN-617
name: Contingent Liability - Probable and Estimable
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

# Contingent Liability - Probable and Estimable

## Definition

A potential obligation arising from past events whose existence will be confirmed by future events, where the likelihood of occurrence is probable and the amount can be reasonably estimated. Such liabilities must be accrued (recorded) on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| likelihood | String | Probability assessment: probable |
| estimability | String | Whether the amount can be reasonably estimated: yes |
| accounting_treatment | String | Record as a liability on the balance sheet and disclose in notes |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
