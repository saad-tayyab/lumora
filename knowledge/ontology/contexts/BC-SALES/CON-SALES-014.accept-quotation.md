---
id: CON-SALES-014
name: AcceptQuotation
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

# AcceptQuotation

## Definition

A command that represents the intent to accept a quotation on behalf of a customer. Processing this command validates the quotation is still within its expiry date, transitions the quotation status to Accepted, and optionally triggers conversion to a sales order.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| quotation_id | UUID v7 | yes | Reference to the Quotation to accept |
| convert_to_order | boolean | yes | Whether to auto-convert accepted quotation to sales order |
| notes | text | no | Acceptance notes |
| initiated_by | UUID v7 | yes | User initiating the command |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-004 (Quotation) | targets | 1:1 | Command targets a quotation |
| CON-SALES-010 (QuotationAccepted) | results-in | 1:1 | Successful execution emits this event |
| CON-SALES-002 (SalesOrder) | may-create | 0..1:1 | May create a sales order if convert_to_order is true |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- Quotation must be in "Sent" or "Draft" status.
- Quotation must not be expired.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
