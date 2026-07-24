---
id: CON-FIN-379
name: Period Costs
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

# Period Costs

## Definition

Selling and administrative expenses that are not part of manufacturing costs. These are reported as expenses on the income statement in the period incurred and never appear on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| selling_expenses | string | Costs incurred in marketing and delivering products (advertising, sales salaries, commissions) |
| administrative_expenses | string | Costs of managing the company not directly related to manufacturing or selling (office salaries, office supplies, depreciation on office) |
| financial_statement_impact | string | Expensed on income statement in period incurred |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
