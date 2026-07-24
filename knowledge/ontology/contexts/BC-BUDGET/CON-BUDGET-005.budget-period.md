---
id: CON-BUDGET-005
name: Budget Period
context: BC-BUDGET
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - budget
  - period
  - value-object
---

# Budget Period

## Definition

A time-bound window that defines the duration for which a budget is valid. Budget periods constrain the dates within which budget headers can exist and consumption can be recorded.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| name | varchar(100) | yes | Human-readable period name (e.g. "FY2026 Q1") |
| startDate | date | yes | Start of the period |
| endDate | date | yes | End of the period |
| status | enum | yes | draft, active, closed |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-BUDGET-001 (Budget Header) | used-by | 1:N | One period may have multiple budget headers |

## Business Rules

- BR-018: Budget consumption is tracked per GL account per period

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-018
