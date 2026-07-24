---
id: CON-AP-005
name: PaymentSchedule
context: BC-AP
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - payment
  - value-object
---

# PaymentSchedule

## Definition

An immutable value object describing when and how a bill should be paid. Encapsulates the payment terms, due date, and any installment configuration. Identity is derived from its attribute values.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| terms | string(50) | yes | Payment terms (e.g., "Net 30", "Net 60") |
| due_date | date | yes | Calculated or explicit due date |
| is_installment | boolean | yes | Whether payment is split across installments |
| installment_count | integer | no | Number of installments (if applicable) |
| installment_interval_days | integer | no | Days between installments |
| early_payment_discount_pct | numeric(5,4) | no | Discount percentage for early payment |
| early_payment_discount_days | integer | no | Days within which discount applies |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | used-by | N:1 | Schedule is applied to a bill |

## Invariants

- Due date must be on or after the bill date.
- Installment count must be positive when is_installment is true.
- Early payment discount days must be less than the total payment window.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
