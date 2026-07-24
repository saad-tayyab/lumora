---
id: CON-FIN-545
name: Sensitivity Analysis
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

# Sensitivity Analysis

## Definition

An analytical technique that considers the impact of changing one or more inputs or assumptions on the resulting output of an analysis, used to assess how sensitive results are to estimation errors.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| base_case_assumptions | object | Initial set of estimated inputs |
| varied_inputs | array | Inputs that are changed to test impact on output |
| output_range | array | Range of possible outcomes (e.g., NPV under different cash flow scenarios) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
