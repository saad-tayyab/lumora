# Report Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** ERP Architect  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines how business reports and analytics are captured in the Lumora ERP knowledge repository.

---

## 2. Report ID Format

```
RPT-{CONTEXT}-{NUMBER}
```

| Part | Rule | Example |
|------|------|---------|
| `RPT` | Fixed prefix | `RPT` |
| `{CONTEXT}` | Bounded context code | `FIN`, `AR`, `INV` |
| `{NUMBER}` | Zero-padded 3-digit sequence | `001`, `042` |

---

## 3. Report Types

| Type | Description | Example |
|------|-------------|---------|
| `financial` | Financial statements | Balance Sheet, P&L |
| `operational` | Day-to-day operations | Stock Report |
| `analytical` | KPIs and metrics | Revenue by Region |
| `regulatory` | Compliance reports | Tax Summary |
| `management` | Executive dashboards | Monthly Summary |

---

## 4. Report Structure

```markdown
---
id: RPT-FIN-001
name: Balance Sheet
context: BC-FIN
type: financial
frequency: period-end
status: active
version: 1.0.0
owners:
  - ERP Architect
  - CPA
concepts:
  - CON-FIN-002
  - CON-FIN-005
rules:
  - BR-001
---

# Balance Sheet

## Purpose
Shows the financial position of the organization at a specific point in time.

## Data Sources
| Source | Context | Entity |
|--------|---------|--------|
| Chart of Accounts | BC-FIN | Account |
| Journal Entry Lines | BC-FIN | JournalEntryLine |
| Account Balances | BC-FIN | AccountBalance |

## Structure
| Section | Accounts | Formula |
|---------|----------|---------|
| Assets | 1000-1999 | SUM(debits) - SUM(credits) |
| Liabilities | 2000-2999 | SUM(credits) - SUM(debits) |
| Equity | 3000-3999 | SUM(credits) - SUM(debits) |

## Output Format
- **Rows:** Account groups
- **Columns:** Opening Balance, Movement, Closing Balance
- **Currency:** Organization base currency
- **Rounding:** 2 decimal places

## Business Rules
- BR-001: Total Assets must equal Total Liabilities + Total Equity
- BR-010: Balance sheet must be generated at period close

## Filters
| Filter | Type | Required | Description |
|--------|------|----------|-------------|
| period | date | yes | Reporting period end date |
| currency | string | no | Override currency (default: base) |
| department | UUID | no | Filter by department |

## Access Control
- **View:** Accountant, Manager, Auditor
- **Export:** Accountant, Manager
```

---

## 5. Report File Organization

```
knowledge/reports/
├── STANDARDS.md
├── INDEX.md
├── active/
│   ├── RPT-FIN-001.balance-sheet.md
│   ├── RPT-FIN-002.income-statement.md
│   ├── RPT-FIN-003.cash-flow.md
│   ├── RPT-AR-001.aging-report.md
│   └── ...
├── deprecated/
│   └── ...
└── templates/
    ├── financial-report-template.md
    └── operational-report-template.md
```

---

## 6. Validation Checklist

- [ ] Report ID follows `RPT-{CTX}-{NUM}` format
- [ ] Data sources are clearly defined
- [ ] All referenced concept IDs exist
- [ ] All referenced rule IDs exist
- [ ] Filters are documented
- [ ] Access control is defined
- [ ] Output format is specified
- [ ] Version bumped for any change
