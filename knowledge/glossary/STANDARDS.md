# Glossary Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Product Ontologist  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines the ubiquitous language for the Lumora ERP system. Every term used in the system must be defined here. The glossary is the authoritative source for terminology.

---

## 2. Glossary Entry Format

```yaml
---
term: Journal Entry
aliases:
  - General Ledger Entry
  - GL Entry
context: BC-FIN
category: accounting
definition: >
  A recording of a financial transaction in the general ledger,
  consisting of at least one debit and one credit line item.
related_terms:
  - Chart of Accounts
  - Double-Entry Bookkeeping
concepts:
  - CON-FIN-003
rules:
  - BR-001
status: active
version: 1.0.0
---
```

---

## 3. Entry Fields

| Field | Required | Description |
|-------|----------|-------------|
| `term` | yes | The canonical term |
| `aliases` | no | Alternative names |
| `context` | yes | Primary bounded context |
| `category` | yes | Classification (see Section 4) |
| `definition` | yes | Clear, concise definition |
| `related_terms` | no | Associated terms |
| `concepts` | no | Linked ontology concepts |
| `rules` | no | Linked business rules |
| `status` | yes | `active`, `deprecated`, `proposed` |
| `version` | yes | Semantic version |

---

## 4. Categories

| Category | Description |
|----------|-------------|
| `accounting` | Financial and accounting terms |
| `inventory` | Stock and warehouse terms |
| `sales` | Sales and customer terms |
| `procurement` | Purchasing and vendor terms |
| `hr` | Human resources terms |
| `technical` | System and architecture terms |
| `general` | Cross-domain terms |

---

## 5. Glossary Structure

```markdown
---
term: Journal Entry
aliases:
  - General Ledger Entry
  - GL Entry
context: BC-FIN
category: accounting
version: 1.0.0
status: active
---

# Journal Entry

## Definition
A recording of a financial transaction in the general ledger, consisting of at least one debit and one credit line item.

## Context
Used in double-entry bookkeeping. Every transaction affects at least two accounts.

## Examples
- Recording a sales revenue with corresponding accounts receivable
- Recording an expense with corresponding accounts payable

## Related Terms
- [Chart of Accounts](chart-of-accounts.md) — The structure of accounts
- [Double-Entry Bookkeeping](double-entry-bookkeeping.md) — The accounting method

## Implementation
- Concept: [CON-FIN-003](../ontology/contexts/BC-FIN/CON-FIN-003.journal-entry.md)
- Rule: [BR-001](../rules/active/BR-001.journal-entry-must-balance.md)
```

---

## 6. Glossary File Organization

```
knowledge/glossary/
├── STANDARDS.md                    # This file
├── INDEX.md                        # Alphabetical index
├── accounting/
│   ├── chart-of-accounts.md
│   ├── journal-entry.md
│   ├── double-entry-bookkeeping.md
│   ├── accounts-receivable.md
│   ├── accounts-payable.md
│   ├── general-ledger.md
│   ├── trial-balance.md
│   ├── balance-sheet.md
│   └── income-statement.md
├── inventory/
│   ├── stock-keeping-unit.md
│   ├── stock-movement.md
│   ├── warehouse.md
│   └── reorder-point.md
├── sales/
│   ├── sales-order.md
│   ├── quotation.md
│   └── customer.md
├── procurement/
│   ├── purchase-order.md
│   ├── vendor.md
│   └── goods-received.md
├── hr/
│   ├── employee.md
│   ├── payroll.md
│   └── leave-request.md
├── technical/
│   ├── bounded-context.md
│   ├── aggregate.md
│   └── domain-event.md
└── general/
    └── multi-tenancy.md
```

---

## 7. Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Entry files | `{kebab-case-term}.md` | `journal-entry.md` |
| Term names | Title Case | "Journal Entry" |
| Aliases | Lowercase, comma-separated | "general ledger entry, gl entry" |

---

## 8. Cross-Referencing Rules

1. Every glossary term must link to its bounded context.
2. Every glossary term must link to relevant ontology concepts.
3. Every glossary term must link to relevant business rules.
4. Related terms must cross-reference each other bidirectionally.
5. Deprecated terms must link to their replacement.

---

## 9. Validation Checklist

- [ ] Term follows Title Case
- [ ] File name is kebab-case version of term
- [ ] YAML front matter contains all required fields
- [ ] Definition is clear and concise
- [ ] Bounded context exists in DOMAIN.md
- [ ] All concept IDs exist in ontology
- [ ] All rule IDs exist in rules
- [ ] Related terms cross-reference bidirectionally
- [ ] No duplicate terms
- [ ] Version bumped for any change
