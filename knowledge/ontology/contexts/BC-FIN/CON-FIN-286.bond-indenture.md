---
id: CON-FIN-286
name: Bond Indenture
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

# Bond Indenture

## Definition

A legal agreement between the bond issuer and bondholders that specifies the terms of the bond issue, including required financial ratios and maintenance provisions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| required_ratios | string | Financial ratios the company must maintain (e.g., working capital, current ratio) |
| covenants | string | Restrictions and requirements imposed on the issuer |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
