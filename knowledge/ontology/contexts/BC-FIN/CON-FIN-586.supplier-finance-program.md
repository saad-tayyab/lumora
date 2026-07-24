---
id: CON-FIN-586
name: Supplier Finance Program
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

# Supplier Finance Program

## Definition

A voluntary program facilitated through a third-party platform where financial institutions offer suppliers the option to finance valid payment obligations from the company.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| outstanding_obligations | Money | Total supplier obligations confirmed as valid under the program |
| third_party_platform | String | Platform connecting company, suppliers, and financial institutions |
| company_guarantee | Boolean | Whether the company provides guarantees (typically No) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
