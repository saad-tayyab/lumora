---
id: CON-PROC-013
name: VendorQualificationPolicy
context: BC-PROC
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - vendor
  - policy
---

# VendorQualificationPolicy

## Definition

A business policy that defines the rules and criteria a vendor must meet before being eligible to receive purchase orders. This policy ensures only qualified vendors participate in the procurement process.

## Policy Rules

| Rule | Description |
|------|-------------|
| VENDOR-001 | Vendor must have a valid tax identification number. |
| VENDOR-002 | Vendor must have completed the onboarding process. |
| VENDOR-003 | Vendor must not be on the suspended or blacklisted vendors list. |
| VENDOR-004 | Vendor must have an active status in the system. |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-001 (Vendor) | governs | N:1 | Policy applies to vendors |
| CON-PROC-010 (CreatePurchaseOrder) | enforces | 1:N | Policy enforced during PO creation |

## Invariants

- INV-PROC-034: A vendor must pass all qualification rules before a PO can be created against them.

## Business Rules

- Vendor qualification is checked at PO creation time (CON-PROC-010).
- Suspended vendors cannot receive new purchase orders.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
