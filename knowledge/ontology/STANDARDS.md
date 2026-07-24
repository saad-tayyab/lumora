# Ontology Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Product Ontologist  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines how domain concepts, relationships, and constraints are represented in the Lumora ERP ontology. Every ontology artifact must comply with these standards.

---

## 2. Concept Definition

A **concept** is a domain entity that exists within a bounded context. Concepts are the building blocks of the ontology.

### 2.1 Concept ID Format

```
CON-{CONTEXT}-{NUMBER}
```

| Part | Rule | Example |
|------|------|---------|
| `CON` | Fixed prefix | `CON` |
| `{CONTEXT}` | Bounded context code from DOMAIN.md | `FIN`, `AR`, `INV` |
| `{NUMBER}` | Zero-padded 3-digit sequence | `001`, `042` |

**Examples:**
- `CON-FIN-001` — Chart of Accounts
- `CON-AR-001` — Customer Invoice
- `CON-INV-001` — Stock Item

### 2.2 Concept File Format

Each concept lives in its own `.md` file with YAML front matter.

```yaml
---
id: CON-FIN-001
name: Chart of Accounts
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounting
  - financial
  - core
---
```

### 2.3 Concept Types

| Type | Description | Example |
|------|-------------|---------|
| `entity` | Mutable object with identity | Customer, Invoice |
| `value_object` | Immutable, identity by attributes | Money, Address |
| `aggregate` | Cluster of entities with consistency boundary | Journal Entry (with Line Items) |
| `event` | Something that happened in the domain | InvoiceCreated |
| `command` | An intent to perform an action | CreateInvoice |
| `policy` | A business rule or invariant | InvoiceTotalMustBalance |
| `role` | A user permission context | Accountant, Approver |

### 2.4 Concept Structure

```markdown
---
id: CON-FIN-001
name: Chart of Accounts
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - accounting
  - financial
---

# Chart of Accounts

## Definition
The structured list of all financial accounts used by an organization.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| code | string(20) | yes | Account code (e.g., "1000") |
| name | string(100) | yes | Account display name |
| type | enum | yes | Asset, Liability, Equity, Revenue, Expense |
| parent_id | UUID | no | Parent account for hierarchy |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-002 (Account) | has-many | 1:N | Contains accounts |

## Invariants
- INV-FIN-005: Account types are restricted to predefined enum values.
- INV-FIN-006: Account codes must be unique within a chart.

## Business Rules
- BR-001: Account codes follow organizational numbering convention.
- BR-002: Deactivated accounts cannot receive new postings.

## Events
- ChartOfAccountsInitialized
- AccountAdded
- AccountDeactivated

## References
- [Domain Constitution](../constitution/DOMAIN.md#41-financial-invariants)
- [Database Schema](../../packages/database/src/features/financial/accounts/accounts.schema.ts)
```

---

## 3. Relationship Definition

### 3.1 Relationship ID Format

```
REL-{NUMBER}
```

| Part | Rule | Example |
|------|------|---------|
| `REL` | Fixed prefix | `REL` |
| `{NUMBER}` | Zero-padded 3-digit sequence | `001`, `042` |

### 3.2 Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| `has-many` | One-to-many | Chart has many Accounts |
| `belongs-to` | Many-to-one | Account belongs to Chart |
| `has-one` | One-to-one | User has one Profile |
| `uses` | Dependency | Journal Entry uses Accounts |
| `triggers` | Event causation | InvoiceCreated triggers PaymentDue |
| `enforces` | Constraint | Policy enforces Rule |
| `extends` | Inheritance | CheckingAccount extends BankAccount |

### 3.3 Relationship Metadata

```yaml
---
id: REL-001
source: CON-FIN-001
target: CON-FIN-002
type: has-many
cardinality: "1:N"
required: true
description: "A chart contains multiple accounts"
version: 1.0.0
---
```

---

## 4. Constraint Definition

### 4.1 Constraint ID Format

```
CTR-{CONTEXT}-{NUMBER}
```

### 4.2 Constraint Types

| Type | Description |
|------|-------------|
| `unique` | Value must be unique |
| `required` | Value cannot be null |
| `range` | Value must be within bounds |
| `pattern` | Value must match regex |
| `enum` | Value must be in set |
| `dependency` | Requires another field |
| `invariant` | Always true for valid state |

### 4.3 Constraint Metadata

```yaml
---
id: CTR-FIN-001
concept: CON-FIN-002
attribute: code
type: unique
scope: chart_id
description: "Account codes must be unique within a chart"
severity: error
version: 1.0.0
---
```

---

## 5. Ontology File Organization

```
knowledge/ontology/
├── STANDARDS.md                    # This file
├── INDEX.md                        # Master index of all concepts
├── contexts/
│   ├── BC-AUTH/
│   │   ├── CON-AUTH-001.user.md
│   │   ├── CON-AUTH-002.role.md
│   │   └── relationships.md
│   ├── BC-FIN/
│   │   ├── CON-FIN-001.chart-of-accounts.md
│   │   ├── CON-FIN-002.account.md
│   │   ├── CON-FIN-003.journal-entry.md
│   │   └── relationships.md
│   ├── BC-AR/
│   ├── BC-AP/
│   ├── BC-CASH/
│   ├── BC-INV/
│   ├── BC-PROC/
│   ├── BC-SALES/
│   ├── BC-HR/
│   ├── BC-REPORT/
│   └── BC-AI/
├── relationships/
│   ├── REL-001.md
│   ├── REL-002.md
│   └── INDEX.md
├── constraints/
│   ├── CTR-FIN-001.md
│   ├── CTR-FIN-002.md
│   └── INDEX.md
└── diagrams/
    ├── domain-map.mermaid
    └── aggregate-boundaries.mermaid
```

---

## 6. Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Concept files | `CON-{CTX}-{NUM}.{kebab-name}.md` | `CON-FIN-001.chart-of-accounts.md` |
| Relationship files | `REL-{NUM}.{kebab-name}.md` | `REL-001.chart-has-accounts.md` |
| Constraint files | `CTR-{CTX}-{NUM}.{kebab-name}.md` | `CTR-FIN-001.unique-account-code.md` |
| Diagrams | `{purpose}.mermaid` | `domain-map.mermaid` |

---

## 7. Cross-Referencing Rules

1. Every concept file must link to its bounded context definition in DOMAIN.md.
2. Every relationship must reference source and target concept IDs.
3. Every constraint must reference the concept it constrains.
4. No orphan concepts — every concept belongs to exactly one context.
5. Bidirectional links are required for all relationships.

---

## 8. Validation Checklist

- [ ] Concept ID follows `CON-{CTX}-{NUM}` format
- [ ] File name matches concept name in kebab-case
- [ ] YAML front matter contains all required fields
- [ ] Bounded context exists in DOMAIN.md
- [ ] All relationships reference valid concept IDs
- [ ] All constraints reference valid concepts
- [ ] No duplicate concept IDs
- [ ] No orphan concepts
- [ ] Cross-references are bidirectional
- [ ] Version bumped for any change
