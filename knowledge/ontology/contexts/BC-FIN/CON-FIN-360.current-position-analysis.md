---
id: CON-FIN-360
name: Current Position Analysis
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Current Position Analysis

## Definition

An evaluation of a company's ability to pay its current liabilities, including working capital, current ratio, and quick ratio measures. This analysis helps short-term creditors assess repayment likelihood.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| working_capital | decimal | Current assets minus current liabilities |
| current_ratio | decimal | Current assets divided by current liabilities |
| quick_ratio | decimal | Quick assets (cash, temporary investments, receivables) divided by current liabilities |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
