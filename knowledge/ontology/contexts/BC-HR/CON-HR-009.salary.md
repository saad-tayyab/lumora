---
id: CON-HR-009
name: Salary
context: BC-HR
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - payroll
  - compensation
---

# Salary

## Definition

An immutable value object representing an employee's compensation structure. Defines the base salary amount, currency, payment frequency, and any allowances. Changes to compensation create a new Salary instance rather than modifying the existing one.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| base_amount | decimal | yes | Base salary amount |
| currency | string(3) | yes | ISO 4217 currency code (e.g., "USD") |
| payment_frequency | enum | yes | Monthly, BiWeekly, Weekly, Annual |
| effective_date | date | yes | Date from which this salary is effective |
| allowances | json | no | Additional allowances (housing, transport, etc.) |
| is_active | boolean | yes | Whether this is the current active salary |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | has-many | 1:N | Employee may have salary history |
| CON-HR-008 (Payslip) | uses | 1:N | Salary is used to calculate payslip |

## Invariants

- INV-HR-027: Base amount must be non-negative.
- INV-HR-028: Currency must be valid ISO 4217 code.
- INV-HR-029: Effective date must be provided.
- INV-HR-030: Value object is immutable — changes create new instance.
- BR-001: All monetary values use decimal arithmetic (not float).

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
