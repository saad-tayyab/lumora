---
id: CON-FIN-607
name: Equity
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

# Equity

## Definition

The ownership interest in the assets of an entity after deducting liabilities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| owner_equity | Money | Owner's claim in a sole proprietorship |
| partnership_equity | Money | Partners' collective claim |
| stockholders_equity | Money | Stockholders' claim in a corporation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
