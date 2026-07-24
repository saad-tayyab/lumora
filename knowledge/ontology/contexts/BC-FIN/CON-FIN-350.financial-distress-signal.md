---
id: CON-FIN-350
name: Financial Distress Signal
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Financial Distress Signal

## Definition

A warning sign of potential bankruptcy or financial difficulty, such as declining cash flows from operating activities over multiple periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| indicator | string | Trend of declining cash flows from operations |
| threshold | string | Multiple consecutive years of declining cash flows |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
