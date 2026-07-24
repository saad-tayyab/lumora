---
id: CON-FIN-059
name: Retained Earnings Statement
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

# Retained Earnings Statement

## Definition

A financial statement that reports changes in retained earnings for a period, showing beginning balance, net income/loss, dividends, and ending balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_balance | Money | Retained earnings at start of period |
| net_income | Money | Net income added during period |
| dividends_declared | Money | Total dividends declared during period |
| prior_period_adjustments | Money | Adjustments for errors in prior periods |
| ending_balance | Money | Retained earnings at end of period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
