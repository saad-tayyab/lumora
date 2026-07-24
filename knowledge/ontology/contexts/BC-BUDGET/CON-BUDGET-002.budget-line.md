---
id: CON-BUDGET-002
name: Budget Line
context: BC-BUDGET
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - budget
  - line
  - entity
---

# Budget Line

## Definition

A per-GL-account budget allocation within a budget header. Each line defines how much of the total budget is allocated to a specific general ledger account, and tracks consumed and remaining amounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| budgetHeaderId | UUID | Reference to owning Budget Header |
| glAccountId | UUID | Reference to GL account for this allocation |
| budgetAmount | decimal(19,4) | Allocated budget amount |
| consumedAmount | decimal(19,4) | Amount consumed so far |
| variance | decimal(19,4) | Difference between budget and consumed |
| notes | text | Optional notes (nullable) |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last modification |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-BUDGET-001 Budget Header | belongs-to | Line belongs to one budget header |
| CON-BUDGET-003 Budget Consumption | has-many | A line has many consumption records |
| CON-BUDGET-004 Budget Variance | computes | Line computes a variance value object |
| CON-FIN-001 Account | uses | Line links to a GL account |

## Invariants

- INV-BUDGET-003: Budget line amounts must sum to the header total

## Business Rules

- BR-018: Budget consumption is tracked per GL account per period
- BR-019: Budget variance is calculated as consumed minus budgeted amount

## Events

- EVT-010: BudgetExceeded

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-018, BR-019
