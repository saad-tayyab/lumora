---
id: CON-FIN-150
name: FOB Destination
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

# FOB Destination

## Definition

A shipping term meaning ownership of goods transfers to the buyer when the goods arrive at the buyer's location. The seller pays freight costs and bears the risk of loss during transit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| title_transfer_point | string | Title transfers when goods arrive at buyer's location |
| freight_responsibility | string | Seller pays shipping costs |
| risk_of_loss | string | Risk remains with seller until delivery to buyer |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
