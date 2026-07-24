---
id: CON-AP-006
name: ThreeWayMatchResult
context: BC-AP
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - matching
  - value-object
  - three-way-match
---

# ThreeWayMatchResult

## Definition

An immutable value object representing the outcome of a three-way match comparison between a purchase order (PO), a receiving report, and a vendor bill. Captures whether the documents match and, if not, the specific discrepancies found.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| purchase_order_id | UUID v7 | yes | Reference to PO from BC-PROC |
| receiving_report_id | UUID v7 | yes | Reference to receiving report from BC-PROC |
| is_matched | boolean | yes | Whether all three documents match |
| quantity_variance | numeric(12,4) | no | Difference in quantities |
| price_variance | numeric(19,4) | no | Difference in unit prices |
| total_variance | numeric(19,4) | no | Difference in total amounts |
| variance_reason | string(500) | no | Explanation of discrepancies |
| matched_at | timestamp | yes | Timestamp when match was performed |
| matched_by | UUID v7 | yes | User who performed the match |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | used-by | N:1 | Result is produced for a bill |
| CON-AP-013 (ThreeWayMatchPolicy) | enforced-by | N:1 | Policy governs the matching logic |

## Invariants

- Total variance must equal price_variance times matched quantity.
- Variance reason is required when is_matched is false.

## Business Rules

- BR-004: Three-way matching required for PO-based bills.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
