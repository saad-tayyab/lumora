---
id: CON-FIN-051
name: Accumulated Depreciation
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

# Accumulated Depreciation

## Definition

A contra asset account that tracks the total depreciation recorded on a fixed asset since it was placed in service. It is deducted from the related fixed asset account on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| balance | decimal | Total depreciation accumulated to date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
