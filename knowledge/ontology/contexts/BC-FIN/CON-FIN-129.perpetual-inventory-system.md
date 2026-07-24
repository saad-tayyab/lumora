---
id: CON-FIN-129
name: Perpetual Inventory System
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Perpetual Inventory System

## Definition

An inventory system where each purchase and sale of merchandise is recorded in the Inventory account and related subsidiary ledger, continuously updating the amount of merchandise available for sale and sold.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| inventory_updates | continuous | Inventory balance is updated with each transaction |
| cost_of_goods_sold | real_time | COGS recorded at time of each sale |
| physical_count | optional | Used to verify inventory balance, not to determine COGS |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
