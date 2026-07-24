---
id: CON-FIN-302
name: Bonds Payable
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

# Bonds Payable

## Definition

Long-term debt instruments issued by a corporation to borrow money from investors, representing a formal promise to pay the face value at maturity plus periodic interest.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of the bond to be repaid at maturity |
| contract_rate | percentage | The stated annual interest rate printed on the bond certificate |
| market_rate | percentage | The effective interest rate demanded by investors at the time of issuance |
| maturity_date | date | The date when the face value is due to be repaid |
| interest_payment_dates | date[] | Dates on which semiannual interest payments are made |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
