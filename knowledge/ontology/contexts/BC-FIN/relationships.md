---
context: BC-FIN
name: Financial Management Relationships
version: 1.0.0
status: active
last_updated: 2026-07-24
owner: Knowledge Engineer
description: >
  Intra-context relationships for the Financial Management bounded context (BC-FIN).
  Defines how financial domain concepts relate to one another within the chart of accounts,
  journal entry processing, asset management, receivables, payables, bank reconciliation,
  and financial reporting.
---

# BC-FIN Relationships

## 1. Chart of Accounts & Account Structure

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-001 | CON-FIN-056 (Chart of Accounts) | CON-FIN-085 (Account) | has-many | 1:N | A chart of accounts contains multiple accounts organized by classification |
| REL-FIN-002 | CON-FIN-085 (Account) | CON-FIN-056 (Chart of Accounts) | belongs-to | N:1 | Every account belongs to exactly one chart of accounts |
| REL-FIN-003 | CON-FIN-085 (Account) | CON-FIN-002 (Asset) | extends | 1:1 | Asset accounts extend the base Account concept with asset-specific behavior |
| REL-FIN-004 | CON-FIN-085 (Account) | CON-FIN-003 (Liability) | extends | 1:1 | Liability accounts extend the base Account concept with liability-specific behavior |
| REL-FIN-005 | CON-FIN-085 (Account) | CON-FIN-005 (Revenue) | extends | 1:1 | Revenue accounts extend the base Account concept with revenue-specific behavior |
| REL-FIN-006 | CON-FIN-085 (Account) | CON-FIN-006 (Expense) | extends | 1:1 | Expense accounts extend the base Account concept with expense-specific behavior |
| REL-FIN-007 | CON-FIN-002 (Asset) | CON-FIN-119 (Current Asset) | extends | 1:1 | Current assets extend assets with short-term liquidity classification |
| REL-FIN-008 | CON-FIN-002 (Asset) | CON-FIN-107 (Fixed Asset) | extends | 1:1 | Fixed assets extend assets with long-term tangible resource classification |
| REL-FIN-009 | CON-FIN-003 (Liability) | CON-FIN-121 (Current Liability) | extends | 1:1 | Current liabilities extend liabilities with short-term obligation classification |
| REL-FIN-010 | CON-FIN-003 (Liability) | CON-FIN-122 (Long-Term Liability) | extends | 1:1 | Long-term liabilities extend liabilities with long-term obligation classification |

## 2. Journal Entry Processing

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-011 | CON-FIN-011 (Journal Entry) | CON-FIN-085 (Account) | uses | N:M | A journal entry debits and credits multiple accounts |
| REL-FIN-012 | CON-FIN-012 (General Journal) | CON-FIN-011 (Journal Entry) | has-many | 1:N | The general journal contains chronological journal entries |
| REL-FIN-013 | CON-FIN-011 (Journal Entry) | CON-FIN-012 (General Journal) | belongs-to | N:1 | Every journal entry is recorded in the general journal |
| REL-FIN-014 | CON-FIN-013 (General Ledger) | CON-FIN-085 (Account) | has-many | 1:N | The general ledger contains all accounts with their balances |
| REL-FIN-015 | CON-FIN-013 (General Ledger) | CON-FIN-011 (Journal Entry) | uses | N:M | The general ledger is updated by posting journal entries |
| REL-FIN-016 | CON-FIN-011 (Journal Entry) | CON-FIN-020 (Adjusting Entry) | extends | 1:1 | Adjusting entries are a specialized type of journal entry made at period end |
| REL-FIN-017 | CON-FIN-011 (Journal Entry) | CON-FIN-021 (Closing Entry) | extends | 1:1 | Closing entries are a specialized type of journal entry that close temporary accounts |

## 3. Asset & Depreciation

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-018 | CON-FIN-107 (Fixed Asset) | CON-FIN-023 (Depreciation) | has-many | 1:N | A fixed asset generates depreciation over its useful life |
| REL-FIN-019 | CON-FIN-107 (Fixed Asset) | CON-FIN-051 (Accumulated Depreciation) | has-one | 1:1 | Each fixed asset has one accumulated depreciation contra account |
| REL-FIN-020 | CON-FIN-107 (Fixed Asset) | CON-FIN-050 (Depreciation Expense) | has-many | 1:N | A fixed asset produces depreciation expense entries each period |
| REL-FIN-021 | CON-FIN-051 (Accumulated Depreciation) | CON-FIN-085 (Account) | extends | 1:1 | Accumulated depreciation is a contra-asset account |
| REL-FIN-022 | CON-FIN-051 (Accumulated Depreciation) | CON-FIN-108 (Contra Account) | extends | 1:1 | Accumulated depreciation is a specific type of contra account |
| REL-FIN-023 | CON-FIN-107 (Fixed Asset) | CON-FIN-109 (Book Value) | has-one | 1:1 | Each fixed asset has a calculated book value (cost minus accumulated depreciation) |
| REL-FIN-024 | CON-FIN-050 (Depreciation Expense) | CON-FIN-006 (Expense) | extends | 1:1 | Depreciation expense extends the base Expense concept |

## 4. Accounts Receivable & Bad Debt

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-025 | CON-FIN-033 (Accounts Receivable) | CON-FIN-085 (Account) | extends | 1:1 | Accounts receivable is a current asset account |
| REL-FIN-026 | CON-FIN-033 (Accounts Receivable) | CON-FIN-217 (Allowance for Doubtful Accounts) | has-one | 1:1 | Accounts receivable has a contra account for estimated uncollectible amounts |
| REL-FIN-027 | CON-FIN-217 (Allowance for Doubtful Accounts) | CON-FIN-108 (Contra Account) | extends | 1:1 | Allowance for doubtful accounts is a contra asset |
| REL-FIN-028 | CON-FIN-218 (Bad Debt Expense) | CON-FIN-006 (Expense) | extends | 1:1 | Bad debt expense is an expense account for estimated uncollectibles |
| REL-FIN-029 | CON-FIN-218 (Bad Debt Expense) | CON-FIN-217 (Allowance for Doubtful Accounts) | enforces | N:1 | Bad debt expense adjusts the allowance for doubtful accounts |

## 5. Accounts Payable & Vendor Obligations

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-030 | CON-FIN-078 (Accounts Payable) | CON-FIN-085 (Account) | extends | 1:1 | Accounts payable is a current liability account |
| REL-FIN-031 | CON-FIN-078 (Accounts Payable) | CON-FIN-121 (Current Liability) | extends | 1:1 | Accounts payable is classified as a current liability |

## 6. Bank Reconciliation & Cash Management

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-032 | CON-FIN-024 (Bank Reconciliation) | CON-FIN-206 (Bank Statement) | uses | N:1 | Bank reconciliation uses the bank statement as the bank-side source |
| REL-FIN-033 | CON-FIN-024 (Bank Reconciliation) | CON-FIN-085 (Account) | uses | N:1 | Bank reconciliation references the cash account from the general ledger |
| REL-FIN-034 | CON-FIN-206 (Bank Statement) | CON-FIN-085 (Account) | uses | N:1 | Bank statement corresponds to a specific cash account |

## 7. Financial Reporting Flow

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-035 | CON-FIN-015 (Income Statement) | CON-FIN-085 (Account) | uses | N:M | Income statement summarizes revenue and expense accounts |
| REL-FIN-036 | CON-FIN-014 (Adjusted Trial Balance) | CON-FIN-013 (General Ledger) | uses | N:1 | Adjusted trial balance is prepared from general ledger balances after adjustments |
| REL-FIN-037 | CON-FIN-015 (Income Statement) | CON-FIN-014 (Adjusted Trial Balance) | uses | N:1 | Income statement is prepared from the adjusted trial balance |
| REL-FIN-038 | CON-FIN-016 (Statement of Owner's Equity) | CON-FIN-015 (Income Statement) | uses | N:1 | Statement of owner's equity incorporates net income from the income statement |
| REL-FIN-039 | CON-FIN-017 (Consolidated Balance Sheet) | CON-FIN-014 (Adjusted Trial Balance) | uses | N:1 | Balance sheet is prepared from the adjusted trial balance |
| REL-FIN-040 | CON-FIN-018 (Statement of Cash Flows) | CON-FIN-015 (Income Statement) | uses | N:1 | Statement of cash flows uses income statement data for operating activities |

## 8. Accounting Period & Closing

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-041 | CON-FIN-055 (Fiscal Year) | CON-FIN-020 (Adjusting Entry) | enforces | 1:N | Adjusting entries are made at the end of each fiscal period |
| REL-FIN-042 | CON-FIN-055 (Fiscal Year) | CON-FIN-021 (Closing Entry) | enforces | 1:N | Closing entries are made at the end of each fiscal period |
| REL-FIN-043 | CON-FIN-021 (Closing Entry) | CON-FIN-085 (Account) | uses | N:M | Closing entries transfer temporary account balances to permanent accounts |
| REL-FIN-044 | CON-FIN-052 (Permanent Account) | CON-FIN-085 (Account) | extends | 1:1 | Permanent accounts are accounts whose balances carry forward |
| REL-FIN-045 | CON-FIN-053 (Temporary Account) | CON-FIN-085 (Account) | extends | 1:1 | Temporary accounts are accounts closed at period end |

## 9. Payroll

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-046 | CON-FIN-264 (Payroll) | CON-FIN-085 (Account) | uses | N:M | Payroll impacts multiple accounts (salaries expense, withholdings payable, cash) |
| REL-FIN-047 | CON-FIN-264 (Payroll) | CON-FIN-121 (Current Liability) | uses | N:M | Payroll generates current liability accounts for withholdings and taxes payable |

## 10. Cross-Cutting Financial Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-FIN-048 | CON-FIN-007 (Business Transaction) | CON-FIN-011 (Journal Entry) | triggers | N:M | A business transaction triggers the creation of journal entries |
| REL-FIN-049 | CON-FIN-008 (T-Account) | CON-FIN-085 (Account) | extends | 1:1 | T-account is the visual representation format of an account |
| REL-FIN-050 | CON-FIN-009 (Debit) | CON-FIN-085 (Account) | uses | N:M | Debit records increases in asset/expense accounts or decreases in liability/equity/revenue accounts |
| REL-FIN-051 | CON-FIN-010 (Credit) | CON-FIN-085 (Account) | uses | N:M | Credit records increases in liability/equity/revenue accounts or decreases in asset/expense accounts |
| REL-FIN-052 | CON-FIN-001 (Accounting Equation) | CON-FIN-002 (Asset) | enforces | 1:N | The accounting equation enforces Assets = Liabilities + Owner's Equity |
| REL-FIN-053 | CON-FIN-001 (Accounting Equation) | CON-FIN-003 (Liability) | enforces | 1:N | The accounting equation enforces Assets = Liabilities + Owner's Equity |
| REL-FIN-054 | CON-FIN-001 (Accounting Equation) | CON-FIN-004 (Owner's Equity) | enforces | 1:N | The accounting equation enforces Assets = Liabilities + Owner's Equity |

---

## Relationship Summary

| Category | Count |
|----------|-------|
| Chart of Accounts & Account Structure | 10 |
| Journal Entry Processing | 7 |
| Asset & Depreciation | 7 |
| Accounts Receivable & Bad Debt | 5 |
| Accounts Payable & Vendor Obligations | 2 |
| Bank Reconciliation & Cash Management | 3 |
| Financial Reporting Flow | 6 |
| Accounting Period & Closing | 5 |
| Payroll | 2 |
| Cross-Cutting Financial Relationships | 7 |
| **Total** | **54** |

---

## Relationship Type Distribution

| Type | Count |
|------|-------|
| has-many | 12 |
| has-one | 5 |
| belongs-to | 3 |
| uses | 16 |
| extends | 15 |
| enforces | 7 |
| triggers | 1 |
| **Total** | **54** |

---

## Source

- Derived from BC-FIN concept definitions
- Aligned with DOMAIN.md financial invariants
- Cross-referenced with STANDARDS.md relationship types
