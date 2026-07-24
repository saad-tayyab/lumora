---
id: REL-SALES-006
source: CON-SALES-005
target: CON-SALES-004
type: belongs-to
cardinality: "N:1"
required: true
description: "A line item belongs to a quotation"
version: 1.0.0
---

# QuotationLineItem belongs-to Quotation

Each line item is a child of a quotation aggregate and cannot exist independently.
