---
id: CON-FIN-324
name: Common Stock
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

# Common Stock

## Definition

The basic class of corporate stock. Each share has equal rights including voting, sharing in dividends, and sharing in assets upon liquidation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| par_value | Money | Par value per share |
| voting_rights | boolean | Right to vote on corporate matters |
| dividend_rights | boolean | Right to share in earnings distributions |
| liquidation_rights | boolean | Right to share in assets upon liquidation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
