---
id: CON-FIN-128
name: Operating Cycle
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Operating Cycle

## Definition

The process by which a company spends cash, generates revenues, and receives cash from customers. For merchandisers, it includes purchasing merchandise, selling it, and collecting from customers.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| phases | list | Cash → Purchases → Merchandise → Sales/Receivables → Cash |
| duration | days | Varies by industry (grocery stores short, jewelry stores long) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
