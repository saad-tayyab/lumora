# Business Rules Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** CPA + Knowledge Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines how business rules are captured, structured, linked, and versioned in the Lumora ERP knowledge repository. Every business rule must comply with these standards.

---

## 2. Rule ID Format

```
BR-{NUMBER}
```

| Part | Rule | Example |
|------|------|---------|
| `BR` | Fixed prefix | `BR` |
| `{NUMBER}` | Zero-padded 3-digit sequence | `001`, `042` |

Rules are globally numbered across all bounded contexts. The number is unique across the entire knowledge repository.

---

## 3. Rule File Format

Each rule lives in its own `.md` file with YAML front matter.

```yaml
---
id: BR-001
name: Journal Entry Must Balance
context: BC-FIN
priority: high
type: invariant
status: active
version: 1.0.0
owners:
  - CPA
  - Product Ontologist
concepts:
  - CON-FIN-003
  - CON-FIN-004
relationships:
  - REL-012
related_rules:
  - BR-002
tags:
  - accounting
  - double-entry
  - integrity
---
```

---

## 4. Rule Types

| Type | Description | Example |
|------|-------------|---------|
| `invariant` | Always true for valid state | Journal entries must balance |
| `constraint` | Restricts valid values | Stock cannot be negative |
| `validation` | Input must satisfy condition | Email must be valid format |
| `business_process` | Defines how work flows | Invoices require approval |
| `computational` | Defines a calculation | Tax = amount × rate |
| `temporal` | Time-based rule | Fiscal year closes Dec 31 |
| `access_control` | Permission rule | Only managers can approve |

---

## 5. Rule Structure

```markdown
---
id: BR-001
name: Journal Entry Must Balance
context: BC-FIN
priority: high
type: invariant
version: 1.0.0
---

# Journal Entry Must Balance

## Statement
Every journal entry must have equal total debits and total credits.

## Rationale
Double-entry accounting requires that every transaction is recorded with equal and opposite effects. This ensures the accounting equation (Assets = Liabilities + Equity) remains balanced.

## Scope
- Applies to: All journal entries
- Bounded Context: BC-FIN (Financial Management)
- Entities: JournalEntry, JournalEntryLine

## Conditions
- WHEN a journal entry is posted
- THEN total debits MUST equal total credits
- OTHERWISE the entry is rejected with error code `ERR_JOURNAL_UNBALANCED`

## Pseudocode
```
function validateJournalEntry(entry):
    totalDebits = sum(entry.lines WHERE type == 'debit')
    totalCredits = sum(entry.lines WHERE type == 'credit')
    
    if totalDebits != totalCredits:
        throw JournalUnbalancedError(entry.id, totalDebits, totalCredits)
```

## Exceptions
- None — this rule has no exceptions.

## Related Rules
- BR-002: Minimum two line items per journal entry
- BR-003: Account must exist in chart of accounts

## Implementation References
- [Domain Invariant](../../constitution/DOMAIN.md#inv-fin-001)
- [Service](../../services/backend/src/features/financial/journal-entries/journal-entry.service.ts)
- [Test](../../services/backend/src/features/financial/journal-entries/journal-entry.test.ts)

## Change History
| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | CPA |
```

---

## 6. Rule Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique rule identifier |
| `name` | yes | Human-readable name |
| `context` | yes | Bounded context from DOMAIN.md |
| `priority` | yes | `critical`, `high`, `medium`, `low` |
| `type` | yes | Rule type from Section 4 |
| `status` | yes | `active`, `deprecated`, `proposed` |
| `version` | yes | Semantic version |
| `owners` | yes | Responsible parties |
| `concepts` | no | Related concept IDs |
| `relationships` | no | Related relationship IDs |
| `related_rules` | no | Other rule IDs |
| `tags` | no | Searchable keywords |
| `effective_date` | no | When rule takes effect |
| `expiry_date` | no | When rule expires |

---

## 7. Priority Levels

| Level | Description | Enforcement |
|-------|-------------|-------------|
| `critical` | Must never be violated | Hard block, system error |
| `high` | Must be enforced | Validation error |
| `medium` | Should be enforced | Warning, can be overridden |
| `low` | Advisory | Suggestion only |

---

## 8. Rule Organization

```
knowledge/rules/
├── STANDARDS.md                    # This file
├── INDEX.md                        # Master index of all rules
├── active/
│   ├── BR-001.journal-entry-must-balance.md
│   ├── BR-002.minimum-two-line-items.md
│   ├── BR-003.account-must-exist.md
│   └── ...
├── deprecated/
│   └── ...
└── proposed/
    └── ...
```

---

## 9. Linking Rules

### 9.1 Rules to Concepts

Every rule must reference the concepts it applies to:

```yaml
concepts:
  - CON-FIN-003  # Journal Entry
  - CON-FIN-004  # Journal Entry Line
```

### 9.2 Rules to Rules

Related rules must cross-reference each other:

```yaml
related_rules:
  - BR-002
  - BR-003
```

### 9.3 Rules to Invariants

Rules that implement domain invariants must reference the invariant:

```markdown
## Domain Invariant
Implements INV-FIN-001 from the Domain Constitution.
```

---

## 10. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Rule files | `BR-{NUM}.{kebab-name}.md` | `BR-001.journal-entry-must-balance.md` |
| Rule names | Descriptive sentence | "Journal Entry Must Balance" |
| Rule IDs | `BR-{NUM}` | `BR-001` |

---

## 11. Validation Checklist

- [ ] Rule ID follows `BR-{NUM}` format
- [ ] File name matches rule name in kebab-case
- [ ] YAML front matter contains all required fields
- [ ] Bounded context exists in DOMAIN.md
- [ ] All referenced concept IDs exist
- [ ] All referenced rule IDs exist
- [ ] No duplicate rule IDs
- [ ] Pseudocode is provided
- [ ] Exceptions are documented
- [ ] Implementation references are provided
- [ ] Version bumped for any change
