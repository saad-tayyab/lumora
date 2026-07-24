---
id: CON-FIN-270
name: Payroll Tax
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

# Payroll Tax

## Definition

Taxes levied on employers based on employee payroll, including Social Security, Medicare, federal unemployment (FUTA), and state unemployment (SUTA) taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| social_security_tax | decimal | Employer portion of FICA Social Security |
| medicare_tax | decimal | Employer portion of FICA Medicare |
| futa_tax | decimal | Federal unemployment tax (0.8% on first $7,000) |
| suta_tax | decimal | State unemployment tax (5.4% on first $7,000) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
