---
id: CON-SALES-015
name: QuotationExpiryPolicy
context: BC-SALES
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - quotation
  - policy
  - expiry
---

# QuotationExpiryPolicy

## Definition

A business policy that governs the expiry behavior of quotations. This policy enforces that quotations have a configurable validity period and automatically transitions them to Expired status when the expiry date is reached.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| policy_id | UUID v7 | yes | Unique identifier |
| default_valid_days | integer | yes | Default number of days a quotation is valid |
| min_valid_days | integer | yes | Minimum allowed validity period |
| max_valid_days | integer | yes | Maximum allowed validity period |
| auto_expire | boolean | yes | Whether to automatically expire quotations |
| notification_days | integer | no | Days before expiry to send reminder |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-004 (Quotation) | governs | 1:N | Policy governs expiry of quotations |

## Invariants

- default_valid_days must be between min_valid_days and max_valid_days.
- min_valid_days must be greater than zero.
- notification_days must be less than default_valid_days when specified.

## Business Rules

- BR-007: Quotations expire after configurable days (this policy implements BR-007).

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Business Rule BR-007](../../../../knowledge/constitution/DOMAIN.md#5-business-rules-registry)
