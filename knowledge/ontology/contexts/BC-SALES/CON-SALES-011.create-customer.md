---
id: CON-SALES-011
name: CreateCustomer
context: BC-SALES
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - customer
  - command
---

# CreateCustomer

## Definition

A command that represents the intent to create a new customer record in the system. The command carries all required customer data and is processed by the customer service layer.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| name | string(200) | yes | Customer display name |
| email | string(255) | no | Primary contact email |
| phone | string(50) | no | Primary contact phone |
| address | JSON | no | Billing/shipping address details |
| credit_limit | money | no | Maximum allowable outstanding balance |
| payment_terms | string(50) | no | Default payment terms |
| tax_id | string(100) | no | Tax identification number |
| initiated_by | UUID v7 | yes | User initiating the command |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | creates | 1:1 | Command creates a customer entity |
| CON-SALES-008 (CustomerCreated) | results-in | 1:1 | Successful execution emits this event |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- Customer name must not be empty.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
