---
id: CON-BUDGET-001
name: Budget Header
context: BC-BUDGET
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - budget
  - accounting
  - aggregate
---

# Budget Header

## Definition

The root aggregate that represents a budget definition for a specific period within a tenant. It owns all budget lines and enforces invariants around uniqueness, totals, and lifecycle status.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| name | varchar(200) | Human-readable budget name |
| code | varchar(50) | Short code for the budget |
| startDate | date | Start of the budget period |
| endDate | date | End of the budget period |
| status | enum | draft, active, closed, superseded |
| totalBudget | decimal(19,4) | Total allocated budget amount |
| notes | text | Optional notes (nullable) |
| createdBy | UUID | Reference to the user who created the budget |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last modification |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-BUDGET-002 Budget Line | has-many | A budget header contains many budget lines |
| CON-BUDGET-005 Budget Period | uses | Header spans a budget period |
| CON-FIN-001 Account | uses | Budget lines link to GL accounts |

## Invariants

- INV-BUDGET-002: Only one budget can be active per period per tenant

## Business Rules

- BR-018: Budget consumption is tracked per GL account per period

## Events

- EVT-010: BudgetExceeded
- EVT-012: PeriodClosed

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-018
