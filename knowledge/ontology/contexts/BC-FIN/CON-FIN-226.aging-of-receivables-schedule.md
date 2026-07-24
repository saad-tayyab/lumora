---
id: CON-FIN-226
name: Aging of Receivables Schedule
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

# Aging of Receivables Schedule

## Definition

A detailed schedule that classifies each accounts receivable by the number of days past its due date into age classes. Used to estimate the required balance in the Allowance for Doubtful Accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | String | Customer name |
| balance | Money | Outstanding receivable balance |
| due_date | Date | Date payment was due |
| days_past_due | Integer | Days between due date and analysis date |
| age_class | String | Classification bucket (e.g., Not past due, 1-30, 31-60, 61-90, 91-180, 181-365, Over 365) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
