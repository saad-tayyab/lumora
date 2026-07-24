---
id: CON-FIN-190
name: Inventory Profits (Illusory Profits)
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

# Inventory Profits (Illusory Profits)

## Definition

A portion of FIFO gross profit during periods of rising costs that may not represent real economic gains, as the inventory sold must be replaced at increasingly higher costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cause | string | Rising costs causing FIFO to report higher profits |
| significance | string | Profits may not be sustainable as replacement costs increase |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
