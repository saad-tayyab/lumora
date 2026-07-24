---
id: CON-FIN-303
name: Convertible Bonds
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

# Convertible Bonds

## Definition

Bonds that can be converted into common stock at the option of the bondholder, consisting of two financial instruments: a debt instrument and an equity conversion option.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| debt_portion | numeric | The liability component recorded as bonds payable |
| equity_portion | numeric | The conversion option recorded as additional paid-in capital |
| conversion_ratio | numeric | Number of shares received upon conversion |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
