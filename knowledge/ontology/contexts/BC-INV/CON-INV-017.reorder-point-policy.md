---
id: CON-INV-017
name: ReorderPointPolicy
context: BC-INV
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - policy
  - automation
  - reorder
---

# ReorderPointPolicy

## Definition
A business policy that governs how and when reorder points are evaluated and purchase suggestions are triggered. This policy defines the rules for automated reorder processes, including threshold calculation, notification, and escalation.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| evaluation_frequency | enum | yes | REALTIME, HOURLY, DAILY |
| notification_channels | list(enum) | yes | EMAIL, DASHBOARD, WEBHOOK |
| escalation_threshold | integer | no | Quantity level to escalate (e.g., critical low) |
| auto_generate_purchase_order | boolean | yes | Whether to auto-create PO or only suggest |
| excluded_item_category_ids | list(UUID v7) | no | Categories excluded from auto-reorder |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-007 (ReorderPoint) | evaluates | 1:N | Policy evaluates reorder points |
| CON-INV-012 (ReorderTriggered) | produces | 1:N | Policy produces reorder trigger events |

## Invariants
- evaluation_frequency must be a valid enum value.
- escalation_threshold, if provided, must be <= minimum_quantity of the item's ReorderPoint.

## Business Rules
- BR-005: Reorder points trigger automated purchase suggestions.

## Events
- CON-INV-012 (ReorderTriggered) — emitted when policy conditions are met.

## References
- [Business Rule BR-005](../../constitution/DOMAIN.md#5-business-rules-registry)
