---
id: CON-BUDGET-003
name: Budget Consumption
context: BC-BUDGET
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - budget
  - consumption
  - entity
---

# Budget Consumption

## Definition

An actual spending event tracked against a budget line. Each record captures a single transaction that reduces the remaining budget for a given GL account within the period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| budgetLineId | UUID | Reference to Budget Line being consumed |
| entityId | UUID | Reference to the source document |
| entityType | enum | journal_entry, purchase_order, invoice, bill |
| amount | decimal(19,4) | Amount consumed |
| transactionDate | date | Date of the consuming transaction |
| createdAt | timestamp | Creation time |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-BUDGET-002 Budget Line | belongs-to | Consumption belongs to one budget line |
| CON-FIN-011 Journal Entry | uses | Consumption may originate from a journal entry |
| BC-PROC Purchase Order | uses | Consumption may originate from a purchase order |
| BC-AP Bill | uses | Consumption may originate from a vendor bill |

## Invariants

- INV-BUDGET-001: Budget consumption amounts must be non-negative

## Business Rules

- BR-020: Budget consumption reverses when journal entries are voided

## Events

- EVT-010: BudgetExceeded

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-020
