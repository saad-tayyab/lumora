---
title: BC-TAX Relationships
version: 1.0.0
status: active
context: BC-TAX
---

# BC-TAX (Tax Management) — Relationships

## Intra-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-TAX-001 | CON-TAX-001 (Tax Code) | CON-TAX-002 (Tax Rate Version) | has-many | 1:N | A tax code has multiple rate versions over time |
| REL-TAX-002 | CON-TAX-001 (Tax Code) | CON-TAX-003 (Tax Rule) | has-many | 1:N | A tax code is referenced by auto-assignment rules |
| REL-TAX-003 | CON-TAX-001 (Tax Code) | CON-TAX-004 (Tax Transaction) | has-many | 1:N | A tax code is used in tax transaction records |
| REL-TAX-004 | CON-TAX-001 (Tax Code) | CON-TAX-005 (Tax Liability) | has-many | 1:N | A tax code tracks liability per period |
| REL-TAX-005 | CON-TAX-002 (Tax Rate Version) | CON-TAX-004 (Tax Transaction) | uses | 1:N | Transactions snapshot a specific rate version |
| REL-TAX-006 | CON-TAX-003 (Tax Rule) | CON-TAX-001 (Tax Code) | assigns | N:1 | A rule assigns a tax code when matched |
| REL-TAX-007 | CON-TAX-004 (Tax Transaction) | CON-TAX-005 (Tax Liability) | contributes-to | N:1 | Transactions aggregate into period liability |

## Cross-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-TAX-008 | CON-TAX-001 (Tax Code) | CON-FIN-001 (Chart of Accounts) | uses | N:1 | Tax code links to a GL account for posting |
| REL-TAX-009 | CON-TAX-004 (Tax Transaction) | BC-AR (Invoice) | uses | N:1 | Tax transactions reference invoices in AR |
| REL-TAX-010 | CON-TAX-004 (Tax Transaction) | BC-AP (Bill) | uses | N:1 | Tax transactions reference bills in AP |
| REL-TAX-011 | CON-TAX-004 (Tax Transaction) | BC-FIN (Journal Entry Line) | uses | N:1 | Tax transactions reference journal entry lines |
| REL-TAX-012 | CON-TAX-002 (Tax Rate Version) | BC-TAX (Tax Code) | belongs-to | N:1 | Rate version belongs to a tax code |

## Aggregate Boundaries

| Aggregate Root | Child Entities | Value Objects |
|---------------|---------------|---------------|
| CON-TAX-001 (Tax Code) | CON-TAX-003 (Tax Rule), CON-TAX-004 (Tax Transaction), CON-TAX-005 (Tax Liability) | CON-TAX-002 (Tax Rate Version) |

## References

- [Domain Constitution - BC-TAX](../../../../constitution/DOMAIN.md)
- [Ontology Standards](../../STANDARDS.md)
