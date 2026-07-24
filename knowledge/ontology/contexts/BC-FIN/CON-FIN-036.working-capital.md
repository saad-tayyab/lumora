---
id: CON-FIN-036
name: Working Capital
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

# Working Capital

## Definition

The excess of current assets over current liabilities, computed as Current Assets minus Current Liabilities. It measures the short-term liquidity buffer available to a company.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| current_assets | decimal | Assets expected to be converted to cash or used within one year |
| current_liabilities | decimal | Obligations due within one year |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
