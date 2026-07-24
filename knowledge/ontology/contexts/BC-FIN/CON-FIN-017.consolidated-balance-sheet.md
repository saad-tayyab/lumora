---
id: CON-FIN-017
name: Consolidated Balance Sheet
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

# Consolidated Balance Sheet

## Definition

A financial statement that presents a company's assets, liabilities, and shareholders' equity at a specific point in time, combining the financial position of the parent company and its subsidiaries.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| assets | Map<String, Money> | Resources owned by the company including current assets, PP&E, intangibles, and goodwill |
| liabilities | Map<String, Money> | Obligations including current liabilities, long-term debt, and deferred taxes |
| shareholders_equity | Money | Residual interest: common stock, capital in excess of stated value, AOCI, retained earnings |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
