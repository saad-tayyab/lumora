---
id: CON-FIN-546
name: Expected Value Analysis
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

# Expected Value Analysis

## Definition

An analytical technique that assigns probabilities to various possible inputs and computes a weighted-average output, incorporating uncertainty directly into the analysis.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| possible_outcomes | array | List of possible input values (e.g., cash flow scenarios) |
| probabilities | array | Probability assigned to each outcome |
| expected_value | decimal | Weighted average: sum of (outcome × probability) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
