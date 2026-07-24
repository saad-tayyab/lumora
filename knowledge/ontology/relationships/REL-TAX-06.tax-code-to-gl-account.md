---
id: REL-TAX-006
source: CON-TAX-001
target: CON-FIN-001
type: uses
cardinality: "N:1"
required: true
description: "Tax codes link to GL accounts for liability or asset posting"
version: 1.0.0
status: active
---

# REL-TAX-006: TaxCode uses Account

## Source

- **CON-TAX-001** (TaxCode) — Aggregate root

## Target

- **CON-FIN-001** (Account) — Aggregate root

## Description

Tax codes link to GL accounts for liability or asset posting. Each tax code specifies the GL account where collected tax amounts (liability) or reclaimable tax amounts (asset) are posted in the general ledger.

## Constraints

- INV-FIN-005: Chart of accounts follows a hierarchical structure with strict typing.
- BR-015: Tax amount is calculated and snapshotted at transaction time.
