---
id: CON-FIN-043
name: Corporate Annual Report
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

# Corporate Annual Report

## Definition

A comprehensive report on a company's activities throughout the preceding year, including management's discussion, financial statements, and auditor's report.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| management_discussion | string | MD&A section with management's analysis |
| financial_statements | string | Audited financial statements |
| auditor_report | string | Independent auditor's opinion |
| esg_report | string | Environmental, social, and governance reporting |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
