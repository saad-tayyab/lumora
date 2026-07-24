---
id: CON-FIN-274
name: Defined Benefit Plan
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

# Defined Benefit Plan

## Definition

A pension plan where the company pays the employee a fixed annual pension based on a formula involving years of service, age, and past salary. The employer is obligated to fund future benefits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| annual_pension_cost | decimal | Estimated annual pension obligation |
| funded_amount | decimal | Amount contributed to the pension fund |
| unfunded_liability | decimal | Unfunded amount credited to Unfunded Pension Liability |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
