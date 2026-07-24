---
id: CTR-PROC-005
concept: CON-PROC-006
attribute: status
type: enum
scope: aggregate
description: "PO status must be one of the defined valid values"
severity: error
version: 1.0.0
status: active
---

# CTR-PROC-005: Valid PO Status Values

## Concept
- **CON-PROC-006** (POStatus)

## Attribute
- `status`

## Constraint
The PO status must be one of the defined valid values: draft, pending_approval, approved, partially_received, fully_received, closed, cancelled.

## Allowed Values
- `draft`
- `pending_approval`
- `approved`
- `partially_received`
- `fully_received`
- `closed`
- `cancelled`

## Rationale
Ensures the PO lifecycle state machine is enforced. Invalid statuses would break the procurement workflow and downstream integrations.
