---
id: CON-FIN-057
name: Corporation
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

# Corporation

## Definition

A business organization that is a legal entity separate and distinct from its owners, created under state law by filing articles of incorporation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| charter | Document | Legal document filed with state to create the corporation |
| bylaws | Document | Rules governing internal management |
| limited_liability | boolean | Stockholders not personally liable for corporate debts |
| continuous_life | boolean | Exists regardless of changes in ownership |
| ability_to_raise_capital | boolean | Can raise capital by issuing stock |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
