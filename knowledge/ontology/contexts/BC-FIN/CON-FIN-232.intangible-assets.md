---
id: CON-FIN-232
name: Intangible Assets
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Intangible Assets

## Definition

Long-term assets used in operations that do not exist physically. Examples include patents, copyrights, trademarks, and goodwill. Accounting is similar to fixed assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Acquisition cost of the intangible asset |
| useful_life | integer | Estimated useful life for amortization purposes |
| carrying_value | decimal | Cost less accumulated amortization |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
