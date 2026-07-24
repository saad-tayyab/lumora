---
id: CON-FIN-223
name: Aging Schedule
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

# Aging Schedule

## Definition

A schedule that classifies accounts receivable by the number of days past due. Used in the analysis of receivables method to estimate uncollectible accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | String | Customer name |
| balance | Money | Amount owed |
| days_past_due | Integer | Days past the due date |
| age_class | String | Classification bucket (e.g., 1-30, 31-60) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
