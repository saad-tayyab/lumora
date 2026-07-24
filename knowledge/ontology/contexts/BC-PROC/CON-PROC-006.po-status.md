---
id: CON-PROC-006
name: POStatus
context: BC-PROC
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - status
---

# POStatus

## Definition

An immutable value object representing the current status of a Purchase Order. Encapsulates the PO lifecycle state machine with valid state transitions.

## Allowed Values

| Value | Description |
|-------|-------------|
| draft | PO is being edited, not yet submitted |
| pending_approval | PO submitted and awaiting approval |
| approved | PO approved and sent to vendor |
| partially_received | Some but not all line items received |
| fully_received | All line items have been received |
| closed | PO completed and archived |
| cancelled | PO cancelled before fulfillment |

## State Transitions

```
draft → pending_approval
pending_approval → approved
pending_approval → cancelled
approved → partially_received
approved → cancelled
partially_received → fully_received
fully_received → closed
```

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | used-by | N:1 | Each PO has exactly one status |

## Invariants

- INV-PROC-019: Status transitions must follow the defined state machine.
- INV-PROC-020: A PO cannot transition from draft directly to approved (must go through pending_approval).

## Business Rules

- Status transitions trigger corresponding domain events (e.g., approved → PurchaseOrderApproved).

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
