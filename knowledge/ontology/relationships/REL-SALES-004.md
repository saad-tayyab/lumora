---
id: REL-SALES-004
source: CON-SALES-003
target: CON-SALES-002
type: belongs-to
cardinality: "N:1"
required: true
description: "A line item belongs to a sales order"
version: 1.0.0
---

# SalesOrderLineItem belongs-to SalesOrder

Each line item is a child of a sales order aggregate and cannot exist independently.
