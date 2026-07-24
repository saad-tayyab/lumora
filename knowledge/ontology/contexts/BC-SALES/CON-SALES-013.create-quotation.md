---
id: CON-SALES-013
name: CreateQuotation
context: BC-SALES
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - quotation
  - command
---

# CreateQuotation

## Definition

A command that represents the intent to create a new quotation for a customer. The command carries quotation details including customer reference, line items, pricing, and validity period. The expiry date is calculated based on the configurable valid_days setting.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| customer_id | UUID v7 | yes | Reference to Customer |
| issue_date | date | yes | Date the quotation is issued |
| valid_days | integer | yes | Number of days the quotation is valid |
| line_items | array | yes | Array of line item details (item_id, quantity, unit_price) |
| discount_amount | money | no | Quotation-level discount |
| notes | text | no | Quotation terms/conditions |
| initiated_by | UUID v7 | yes | User initiating the command |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-004 (Quotation) | creates | 1:1 | Command creates a quotation |
| CON-SALES-004 (QuotationExpiryPolicy) | uses | 1:1 | Command uses expiry policy to calculate expiry_date |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- At least one line item is required.
- Customer must exist and be in Active status.
- valid_days must be greater than zero.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Business Rule BR-007](../../../../knowledge/constitution/DOMAIN.md#5-business-rules-registry)
