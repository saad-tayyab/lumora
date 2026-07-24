---
id: CON-FIN-191
name: Consigned Inventory
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

# Consigned Inventory

## Definition

Inventory held by one party (consignee) but owned by another party (consignor). The consignor retains title and bears the risk of loss. The consignee sells the goods and remits payment to the consignor.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| ownership | string | Title remains with consignor |
| consignee_role | string | Holds and sells goods on behalf of consignor |
| risk_of_loss | string | Borne by consignor |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
