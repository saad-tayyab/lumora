---
id: CON-SALES-016
name: CreditCheckPolicy
context: BC-SALES
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - credit
  - policy
  - risk
---

# CreditCheckPolicy

## Definition

A business policy that governs credit checks for customers before allowing sales orders to be confirmed. This policy evaluates the customer's outstanding balance against their credit limit and may require approval for orders that would exceed the limit.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| policy_id | UUID v7 | yes | Unique identifier |
| check_on_order | boolean | yes | Whether to check credit at order creation |
| check_on_delivery | boolean | yes | Whether to check credit before shipment |
| approval_required | boolean | yes | Whether manager approval is needed for over-limit |
| grace_percentage | decimal(5,2) | no | Percentage of credit limit allowed as grace (e.g., 10%) |
| blocked_statuses | array | no | Customer statuses that block orders (e.g., Suspended) |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | evaluates | N:1 | Policy evaluates customer credit |
| CON-SALES-002 (SalesOrder) | gates | 1:N | Policy gates order confirmation |

## Invariants

- grace_percentage must be between 0 and 100 when specified.
- At least one of check_on_order or check_on_delivery must be true.

## Business Rules

- Customer orders are blocked if credit limit is exceeded and approval is not granted.
- Suspended customers cannot place new orders.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Domain Constitution — BC-AR](../../../../knowledge/constitution/DOMAIN.md)
