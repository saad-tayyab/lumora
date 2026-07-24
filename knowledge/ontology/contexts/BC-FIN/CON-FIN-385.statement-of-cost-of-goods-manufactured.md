---
id: CON-FIN-385
name: Statement of Cost of Goods Manufactured
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

# Statement of Cost of Goods Manufactured

## Definition

A manufacturing company statement that summarizes the cost of goods manufactured during the period, showing the flow from beginning work in process through direct materials, direct labor, and manufacturing overhead to cost of goods manufactured.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| steps | string | Step 1: Determine cost of direct materials used; Step 2: Determine total manufacturing costs incurred; Step 3: Determine cost of goods manufactured |
| formula | string | Beg WIP + Total Manufacturing Costs Incurred - End WIP = COGM |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
