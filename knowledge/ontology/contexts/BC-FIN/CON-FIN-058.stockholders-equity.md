---
id: CON-FIN-058
name: Stockholders' Equity
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

# Stockholders' Equity

## Definition

The stockholders' claim on total assets, equal to total assets minus total liabilities. Used in corporate contexts as the equivalent of owner's equity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_assets | money | Total assets of the corporation |
| total_liabilities | money | Total liabilities of the corporation |
| equity | money | Assets minus liabilities |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
