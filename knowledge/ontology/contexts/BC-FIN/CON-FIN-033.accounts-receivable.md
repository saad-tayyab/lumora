---
id: CON-FIN-033
name: Accounts Receivable
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Accounts Receivable

## Definition

Money owed to the business by customers for goods or services provided on credit, recorded as an asset with a normal debit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer_name | string | Name of the customer who owes money |
| amount_owed | decimal | Outstanding balance owed to the business |
| due_date | date | Date payment is expected |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-085 (Account) | extends | 1:1 | Accounts receivable is a current asset account |
| CON-FIN-217 (Allowance for Doubtful Accounts) | has-one | 1:1 | Has a contra account for estimated uncollectible amounts |
| CON-FIN-218 (Bad Debt Expense) | enforces | N:1 | Bad debt expense adjusts the allowance for doubtful accounts |
| CON-FIN-119 (Current Asset) | extends | 1:1 | Classified as a current asset on the balance sheet |
| CON-FIN-017 (Consolidated Balance Sheet) | feeds | N:M | Accounts receivable appears as a current asset on the balance sheet |
| CON-FIN-015 (Income Statement) | feeds | N:M | Bad debt expense appears on the income statement |

## Invariants

- INV-FIN-001: Accounts receivable balance must equal the sum of all outstanding customer balances.
- INV-FIN-003: Every state change (payment, write-off, adjustment) must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-INV-002: Every stock movement (or receivable adjustment) must reference a source document.

## Business Rules

- BR-003: Payment terms are defined per customer.
- BR-182: Write-off against allowance — uncollectible amounts are written off against the allowance.
- BR-184: Percent of sales independent of allowance balance.
- BR-185: Aging method targets ending allowance balance.
- BR-191: AR turnover favorable trend — higher turnover indicates better collection.
- BR-192: Direct write-off does not match revenue — use allowance method instead.

## Events

- InvoiceCreated
- PaymentReceived
- InvoiceOverdue
- BadDebtWriteOff
- AllowanceAdjusted
- CustomerCreditAdjusted

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
