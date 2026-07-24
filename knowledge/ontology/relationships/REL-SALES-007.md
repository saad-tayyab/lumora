---
id: REL-SALES-007
source: CON-SALES-002
target: CON-SALES-006
type: uses
cardinality: "1:1"
required: true
description: "A sales order has a status value object"
version: 1.0.0
---

# SalesOrder uses SalesOrderStatus

Each sales order has a status that tracks its position in the order lifecycle.
