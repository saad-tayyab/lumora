---
id: CON-FIN-364
name: Leverage
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Leverage

## Definition

The use of debt to increase the return on an investment. The effect of leverage is the difference between return on stockholders' equity and return on total assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| effect | decimal | Return on stockholders' equity minus return on total assets |
| positive_when | string | Return on equity exceeds return on assets |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
