---
id: CON-FIN-202
name: Voucher System
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Voucher System

## Definition

A set of procedures for authorizing and recording liabilities and cash payments. A voucher is any document that serves as proof of authority to pay cash or issue an electronic funds transfer.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| voucher_preparation | string | Prepared after receiving supplier's invoice, purchase order, and receiving report |
| approval_process | string | Submitted for approval before payment |
| payment_recording | string | Recorded in accounts and filed by due date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
