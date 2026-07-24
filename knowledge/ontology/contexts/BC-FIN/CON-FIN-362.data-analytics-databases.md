---
id: CON-FIN-362
name: Data Analytics Databases
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

# Data Analytics Databases

## Definition

Publicly available databases used to analyze a company's financial statements, including SimFin, SEC EDGAR, Yahoo! Finance, and MSN Money, which provide financial data, ratios, and market information.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| simfin | string | Covers 2,700+ companies with 300,000+ financial statements |
| sec_edgar | string | SEC filings including 10-K and 10-Q reports |
| yahoo_finance | string | Company financial and market data with ratios and analysis |
| msn_money | string | Company summaries, financial statements, and key statistics |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
