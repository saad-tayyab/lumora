---
id: CON-FIN-329
name: Stock Split
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Stock Split

## Definition

A process by which a corporation reduces the par or stated value of its common stock and issues a proportionate number of additional shares. No journal entry is required.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| split_ratio | string | Ratio of new shares to old shares (e.g., 2-for-1) |
| new_par_value | Money | Reduced par value per share after split |
| new_shares_outstanding | number | Total shares outstanding after split |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
