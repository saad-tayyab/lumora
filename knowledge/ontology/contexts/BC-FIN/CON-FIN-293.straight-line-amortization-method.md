---
id: CON-FIN-293
name: Straight-Line Amortization Method
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

# Straight-Line Amortization Method

## Definition

An amortization method that allocates equal amounts of bond discount or premium to interest expense each period over the bond's life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| periodic_amortization | decimal | Total discount or premium divided by the number of interest periods |
| interest_expense | decimal | Cash interest paid plus/minus the periodic amortization |
| usage | string | Allowed when results do not differ significantly from effective interest method |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
