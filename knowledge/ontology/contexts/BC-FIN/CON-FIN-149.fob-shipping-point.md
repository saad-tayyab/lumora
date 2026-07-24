---
id: CON-FIN-149
name: FOB Shipping Point
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

# FOB Shipping Point

## Definition

A shipping term meaning ownership (title) of goods transfers to the buyer when the seller delivers goods to the common carrier. The buyer pays freight costs and bears the risk of loss during transit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| title_transfer_point | string | Title transfers when goods are delivered to the carrier |
| freight_responsibility | string | Buyer pays shipping costs |
| risk_of_loss | string | Risk transfers to buyer at carrier delivery point |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
