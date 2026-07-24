---
id: CON-FIN-285
name: Bond Payable
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

# Bond Payable

## Definition

A long-term debt instrument issued by a corporation to borrow money from multiple investors, with periodic interest payments and face amount repaid at maturity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | The principal amount to be repaid at maturity |
| contract_rate | decimal | The stated annual interest rate on the bond |
| market_rate | decimal | The prevailing market interest rate at issuance |
| term | integer | Number of years until maturity |
| interest_payment_dates | string | Dates on which interest is paid (e.g., semiannual) |
| issue_date | date | Date the bonds were issued |
| maturity_date | date | Date the principal is due |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
