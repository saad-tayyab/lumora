---
id: CTR-AR-006
concept: CON-AR-001
attribute: payment_terms
type: required
scope: customer
description: "Customer must have valid payment terms"
severity: error
version: 1.0.0
status: active
---

# CTR-AR-006: Customer Must Have Payment Terms

## Definition

Every customer must have payment terms defined. Payment terms determine when invoices are due and are a prerequisite for creating invoices.

## Applies To

- **CON-AR-001** (Customer) — `payment_terms` attribute

## Validation

```
payment_terms IS NOT NULL
payment_terms IN ('Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Due on Receipt', 'Custom')
```

## References

- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry) — BR-003
