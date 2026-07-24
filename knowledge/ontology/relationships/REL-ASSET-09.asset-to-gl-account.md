---
id: REL-ASSET-09
source: CON-ASSET-001
target: CON-FIN-001
type: uses
cardinality: "N:1"
required: true
description: "Each fixed asset links to a GL account for financial posting"
version: 1.0.0
status: active
---

# REL-ASSET-09: FixedAssetRegister uses Account

## Source

- **CON-ASSET-001** (FixedAssetRegister) — Aggregate root

## Target

- **CON-FIN-001** (Account) — Aggregate root

## Description

Each fixed asset links to a GL account for financial posting. The GL account determines where acquisition cost, depreciation expense, and accumulated depreciation are recorded in the chart of accounts.

## Constraints

- INV-FIN-005: Chart of accounts follows a hierarchical structure with strict typing (Asset, Liability, Equity, Revenue, Expense).
- BR-013: Depreciation method cannot change after asset is placed in service.
