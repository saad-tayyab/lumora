---
id: CON-FIN-474
name: Product Profitability Report
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

# Product Profitability Report

## Definition

A management report that shows the revenue, cost of goods sold, gross profit, allocated selling/administrative expenses, and operating income for each product line.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue | decimal | Total sales revenue per product |
| cost_of_goods_sold | decimal | Direct costs attributable to the product |
| gross_profit | decimal | Revenue minus cost of goods sold |
| selling_admin_expenses | decimal | Allocated selling and administrative expenses |
| operating_income | decimal | Gross profit minus allocated expenses |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
