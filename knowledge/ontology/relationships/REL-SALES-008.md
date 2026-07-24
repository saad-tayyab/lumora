---
id: REL-SALES-008
source: CON-SALES-004
target: CON-SALES-002
type: converts-to
cardinality: "1:0..1"
required: false
description: "An accepted quotation may convert to a sales order"
version: 1.0.0
---

# Quotation converts-to SalesOrder

When a quotation is accepted, it may be converted into a sales order. This is optional based on the AcceptQuotation command's convert_to_order flag.
