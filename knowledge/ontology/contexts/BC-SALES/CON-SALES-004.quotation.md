---
id: CON-SALES-004
name: Quotation
context: BC-SALES
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - quotation
  - core
---

# Quotation

## Definition

An aggregate representing a formal offer to a customer specifying products, quantities, prices, and terms. A quotation has a configurable expiry date after which it is no longer valid. When accepted, a quotation can be converted into a sales order.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| quotation_number | string(50) | yes | Human-readable number (e.g., "QT-2026-0001") |
| customer_id | UUID v7 | yes | Reference to Customer (CON-SALES-001) |
| status | enum | yes | Draft, Sent, Accepted, Rejected, Expired, Converted |
| issue_date | date | yes | Date the quotation was issued |
| expiry_date | date | yes | Date the quotation expires |
| subtotal | money | yes | Sum of line items before tax/discount |
| discount_amount | money | no | Total discount applied |
| tax_amount | money | yes | Total tax applied |
| total | money | yes | Final quotation total |
| currency | string(3) | yes | ISO 4217 currency code |
| valid_days | integer | yes | Number of days the quotation is valid |
| notes | text | no | Terms, conditions, or notes |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | belongs-to | N:1 | Quotation belongs to a customer |
| CON-SALES-005 (QuotationLineItem) | has-many | 1:N | Quotation contains many line items |
| CON-SALES-002 (SalesOrder) | converts-to | 1:0..1 | Accepted quotation may convert to sales order |

## Invariants

- INV-CROSS-003: Quotation ID is a globally unique UUID v7.
- expiry_date must be after issue_date.
- Quotation total must equal sum of line item totals minus discounts plus tax.

## Business Rules

- BR-007: Quotations expire after configurable days (valid_days field controls expiry).

## Events

- QuotationCreated
- QuotationSent
- QuotationAccepted
- QuotationRejected
- QuotationExpired
- QuotationConverted

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Business Rule BR-007](../../../../knowledge/constitution/DOMAIN.md#5-business-rules-registry)
