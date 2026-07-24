---
id: CON-FIN-029
name: Matching Principle
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

# Matching Principle

## Definition

Expenses are matched with revenues in the period when the company makes efforts to generate those revenues. Expenses incurred in generating revenues are deducted from the revenue of the same period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| matching_period | string | Expenses matched to the same period as the revenue they help generate |
| purpose | string | Proper matching of costs to revenues for accurate income measurement |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
