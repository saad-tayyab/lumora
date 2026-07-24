---
id: CON-FIN-175
name: Credit Memo
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Credit Memo

## Definition

A bank memorandum indicating an increase (credit) to the company's account. Includes EFT deposits, note collections, loan proceeds, interest earned, and bank error corrections.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| bank_perspective | string | Increase in company's account (liability to bank) |
| examples | string | EFT deposits, note collections, loan proceeds, interest earned |
| journal_entry_required | boolean | Yes - company must record unrecorded credit memos |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
