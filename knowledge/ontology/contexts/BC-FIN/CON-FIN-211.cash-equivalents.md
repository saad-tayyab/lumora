---
id: CON-FIN-211
name: Cash Equivalents
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

# Cash Equivalents

## Definition

Short-term, highly liquid investments with original maturities of three months or less when purchased. Includes U.S. Treasury bills, commercial paper, and money market funds.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| maturity_threshold | string | Original maturity of three months or less when purchased |
| examples | string | U.S. Treasury bills, commercial paper, money market funds, certificates of deposit |
| reporting | string | Reported with cash as 'Cash and cash equivalents' on balance sheet |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
