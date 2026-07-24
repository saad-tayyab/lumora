---
id: CON-FIN-323
name: Stock
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

# Stock

## Definition

A certificate representing ownership interest in a corporation. Also called capital stock or shares.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| par_value | Money | Dollar amount assigned to each share in the charter |
| stated_value | Money | Value assigned to no-par stock by the board |
| authorized_shares | number | Maximum shares the corporation may issue per charter |
| issued_shares | number | Shares that have been sold to stockholders |
| outstanding_shares | number | Issued shares minus treasury shares |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
