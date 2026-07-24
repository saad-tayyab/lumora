---
id: CON-FIN-447
name: Process Costing Journal Entries
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Process Costing Journal Entries

## Definition

Journal entries that record the flow of costs through a process costing system, including costs transferred between departments, conversion costs added, and costs transferred to finished goods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| transferred_in_entry | object | Entry recording costs transferred from prior department |
| materials_entry | object | Entry recording direct materials added |
| conversion_entry | object | Entry recording conversion costs (labor and overhead) |
| transferred_out_entry | object | Entry recording costs transferred to next department or finished goods |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
