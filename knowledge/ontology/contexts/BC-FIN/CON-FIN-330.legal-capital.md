---
id: CON-FIN-330
name: Legal Capital
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

# Legal Capital

## Definition

The minimum amount of paid-in capital that must be retained in the corporation to protect creditors, usually equal to the par or stated value of shares issued.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Minimum paid-in capital required by state law |
| basis | string | Par value or stated value of issued shares |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
