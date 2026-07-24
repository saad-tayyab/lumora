---
id: CON-FIN-080
name: Ratio of Liabilities to Stockholders' Equity
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

# Ratio of Liabilities to Stockholders' Equity

## Definition

A ratio that measures the relationship between the total liabilities and total stockholders' equity, indicating the margin of safety for creditors. Computed as Total Liabilities / Total Stockholders' Equity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_liabilities | money | Total liabilities of the company |
| total_equity | money | Total stockholders' equity |
| ratio | decimal | The computed ratio |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
