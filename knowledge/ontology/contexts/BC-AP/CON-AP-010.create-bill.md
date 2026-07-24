---
id: CON-AP-010
name: CreateBill
context: BC-AP
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - command
  - bill
---

# CreateBill

## Definition

Command representing the intent to create a new vendor bill in the system. When executed, this command creates a Bill aggregate with its line items and emits a BillReceived event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| bill_number | string(50) | yes | Vendor's invoice number |
| bill_date | date | yes | Date on the vendor's invoice |
| due_date | date | yes | Payment due date |
| purchase_order_id | UUID v7 | no | Optional linked PO from BC-PROC |
| line_items | array | yes | Array of line item data |
| notes | text | no | Additional notes |
| created_by | UUID v7 | yes | User creating the bill |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | creates | 1:1 | Command creates one bill |
| CON-AP-007 (BillReceived) | triggers | 1:1 | Command execution emits BillReceived |

## Invariants

- Vendor must exist and be active.
- Bill number must be unique per vendor.
- At least one line item is required.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
