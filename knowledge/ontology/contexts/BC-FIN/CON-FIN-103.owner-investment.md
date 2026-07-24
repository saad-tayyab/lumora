---
id: CON-FIN-103
name: Owner Investment
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Owner Investment

## Definition

An injection of personal assets by the owner into the business, recorded as a debit to the asset received and a credit to the owner's capital account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| owner_name | string | Name of the business owner |
| amount | decimal | Value of assets invested |
| asset_type | string | Type of asset invested (cash, equipment, etc.) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
