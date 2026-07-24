---
id: CON-FIN-363
name: Ratio of Fixed Assets to Long-Term Liabilities
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

# Ratio of Fixed Assets to Long-Term Liabilities

## Definition

A solvency ratio measuring how much fixed assets a company has to support its long-term debt, computed as Fixed Assets (net) divided by Long-Term Liabilities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| fixed_assets_net | currency | Net property, plant, and equipment |
| long_term_liabilities | currency | Total long-term debt obligations |
| ratio | decimal | Fixed assets / Long-term liabilities |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
