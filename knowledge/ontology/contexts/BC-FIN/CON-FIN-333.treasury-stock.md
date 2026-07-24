---
id: CON-FIN-333
name: Treasury Stock
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

# Treasury Stock

## Definition

Stock that a corporation has issued and then reacquired. Treasury stock is not considered outstanding and does not receive dividends.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| shares | number | Number of shares reacquired |
| cost | Money | Reacquisition price per share |
| total_cost | Money | Total cost of treasury shares |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
