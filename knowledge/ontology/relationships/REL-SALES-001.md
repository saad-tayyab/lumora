---
id: REL-SALES-001
source: CON-SALES-001
target: CON-SALES-002
type: has-many
cardinality: "1:N"
required: true
description: "A customer places many sales orders"
version: 1.0.0
---

# Customer has-many SalesOrders

A customer can place multiple sales orders over time. Each sales order belongs to exactly one customer.
