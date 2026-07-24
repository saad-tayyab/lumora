---
id: REL-SALES-002
source: CON-SALES-001
target: CON-SALES-004
type: has-many
cardinality: "1:N"
required: true
description: "A customer receives many quotations"
version: 1.0.0
---

# Customer has-many Quotations

A customer can receive multiple quotations over time. Each quotation belongs to exactly one customer.
