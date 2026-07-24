---
id: REL-SALES-003
source: CON-SALES-002
target: CON-SALES-003
type: has-many
cardinality: "1:N"
required: true
description: "A sales order contains many line items"
version: 1.0.0
---

# SalesOrder has-many SalesOrderLineItems

A sales order contains one or more line items representing the products or services being purchased.
