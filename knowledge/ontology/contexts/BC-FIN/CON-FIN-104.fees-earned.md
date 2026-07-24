---
id: CON-FIN-104
name: Fees Earned
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

# Fees Earned

## Definition

Revenue generated from services provided to customers, recorded as a credit to Fees Earned and a debit to Cash or Accounts Receivable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Revenue amount earned |
| customer | string | Customer who received the services |
| service_description | string | Description of services provided |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
