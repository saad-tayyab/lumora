---
id: CON-FIN-267
name: FICA Tax
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

# FICA Tax

## Definition

Federal Insurance Contributions Act tax withheld from employee earnings, consisting of Social Security tax (6.2%) and Medicare tax (1.45%). Employers must match the employee's FICA contribution.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| social_security_rate | decimal | 6.2% on earnings up to annual threshold |
| medicare_rate | decimal | 1.45% on all earnings |
| employee_amount | decimal | FICA withheld from employee |
| employer_amount | decimal | FICA matched by employer |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
