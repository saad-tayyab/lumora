---
id: CON-FIN-176
name: Inventory Cost Flow Assumption
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

# Inventory Cost Flow Assumption

## Definition

An assumption about the order in which costs flow from inventory to cost of goods sold when identical units of merchandise are acquired at different unit costs during a period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| method_name | string | Name of the cost flow method (FIFO, LIFO, Weighted Average) |
| assumption | string | The assumed order of cost flow |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
