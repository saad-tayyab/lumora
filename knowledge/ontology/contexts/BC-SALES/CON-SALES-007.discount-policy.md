---
id: CON-SALES-007
name: DiscountPolicy
context: BC-SALES
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - discount
  - pricing
  - value-object
---

# DiscountPolicy

## Definition

An immutable value object that encapsulates the rules for applying discounts to sales orders or quotations. Discounts can be applied at the line level or order level and may be based on percentage, fixed amount, or volume-based rules.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| policy_id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Discount policy name |
| type | enum | yes | Percentage, FixedAmount, VolumeBased |
| value | decimal(12,2) | yes | Discount value (percent or amount) |
| min_quantity | decimal(12,2) | no | Minimum quantity for volume-based discounts |
| max_discount_amount | money | no | Maximum discount cap |
| valid_from | date | yes | Start date for policy validity |
| valid_until | date | no | End date for policy validity |
| customer_id | UUID v7 | no | Customer-specific discount (null for general) |

## Allowed Types

| Type | Description |
|------|-------------|
| Percentage | Discount as a percentage of the line/order total |
| FixedAmount | Discount as a fixed monetary amount |
| VolumeBased | Discount based on quantity thresholds |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | may-apply-to | N:0..1 | Policy may be customer-specific |

## Invariants

- Percentage values must be between 0 and 100.
- FixedAmount values must be non-negative.
- valid_until must be after valid_from when specified.
- max_discount_amount must be non-negative when specified.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
