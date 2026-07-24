---
id: CTR-SALES-003
concept: CON-SALES-002
attribute: id
type: unique
scope: global
description: "SalesOrder IDs must be globally unique (UUID v7)"
severity: error
version: 1.0.0
---

# CTR-SALES-003: Unique SalesOrder ID

Sales order IDs are globally unique UUID v7 values, ensuring no collisions across bounded contexts.
