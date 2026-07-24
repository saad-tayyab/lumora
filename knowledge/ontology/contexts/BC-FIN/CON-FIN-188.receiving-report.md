---
id: CON-FIN-188
name: Receiving Report
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

# Receiving Report

## Definition

A document completed when inventory is received, establishing an initial record of the receipt. It is compared to the purchase order to verify that the correct items, quantities, and prices were received.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date_received | date | Date inventory was received |
| items_received | string | Description and quantity of items received |
| condition | string | Condition of received items |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
