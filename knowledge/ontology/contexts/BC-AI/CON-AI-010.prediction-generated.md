---
id: CON-AI-010
name: PredictionGenerated
context: BC-AI
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - prediction
  - event
---

# PredictionGenerated

## Definition

A domain event emitted when a new Prediction is successfully generated. Used for cross-context communication and audit trail.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| prediction_id | UUID v7 | yes | Generated prediction reference |
| prediction_type | enum | yes | Type of prediction generated |
| entity_type | string(100) | yes | Business entity type predicted |
| entity_id | UUID v7 | yes | Specific entity reference |
| confidence_score | decimal(5,4) | yes | Prediction confidence |
| tenant_id | UUID v7 | yes | Tenant owner |
| timestamp | timestamp | yes | Event emission timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-003 (Prediction) | refers-to | N:1 | Prediction that was generated |

## Invariants

- INV-CROSS-003: Event ID is a globally unique UUID v7.
- INV-AI-020: PredictionGenerated must include prediction_id and confidence_score.

## Business Rules

- Events are immutable once emitted.
- Events are the only cross-context communication mechanism (INV-CROSS-002).

## Events

- None (this IS an event)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md#7-event-catalog)
