---
id: CON-FIN-312
name: Admission of New Partner by Investment
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Admission of New Partner by Investment

## Definition

The process of admitting a new partner who invests assets directly into the partnership, potentially creating a bonus to existing partners or the new partner based on the agreed ownership percentage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| new_partner_name | string | The incoming partner's name |
| investment_amount | numeric | Assets invested by the new partner |
| ownership_percentage | percentage | The new partner's agreed ownership interest |
| bonus_to_existing | numeric | Bonus allocated to existing partners if any |
| bonus_to_new | numeric | Bonus to the new partner if any |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
