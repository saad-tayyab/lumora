---
id: CON-AR-016
name: CreditApprovalPolicy
context: BC-AR
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - policy
  - credit
---

# CreditApprovalPolicy

## Definition

A business policy that governs whether a new invoice can be created for a customer based on their current outstanding balance and credit limit. Before an invoice is issued, this policy checks that the customer's total outstanding balance plus the new invoice amount does not exceed their approved credit limit. If the limit is exceeded, the invoice must be routed for manual approval.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string(100) | yes | Policy name |
| description | text | yes | Policy description |
| evaluation_type | enum | yes | Pre-creation, Periodic, On-demand |
| is_active | boolean | yes | Whether the policy is currently active |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-008 (CreditLimit) | enforces | — | Evaluates against the customer's credit limit |
| CON-AR-013 (CreateInvoice) | enforces | — | Enforced during invoice creation |

## Invariants

- None.

## Business Rules

- BR-003: Payment terms (including credit limits) are defined per customer.

## Events

- CreditLimitExceeded (when policy check fails)

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
