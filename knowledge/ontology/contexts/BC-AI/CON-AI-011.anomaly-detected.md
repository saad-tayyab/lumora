---
id: CON-AI-011
name: AnomalyDetected
context: BC-AI
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - anomaly
  - event
---

# AnomalyDetected

## Definition

A domain event emitted when an anomaly is detected in business data. Used for cross-context communication, alerting, and audit trail.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| anomaly_id | UUID v7 | yes | Anomaly detection reference |
| severity | enum | yes | low, medium, high, critical |
| entity_type | string(100) | yes | Business entity type affected |
| entity_id | UUID v7 | yes | Specific entity reference |
| anomaly_score | decimal(5,4) | yes | Anomaly confidence score |
| tenant_id | UUID v7 | yes | Tenant owner |
| timestamp | timestamp | yes | Event emission timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-004 (AnomalyDetection) | refers-to | N:1 | Anomaly that was detected |

## Invariants

- INV-CROSS-003: Event ID is a globally unique UUID v7.
- INV-AI-021: AnomalyDetected must include anomaly_id and severity.

## Business Rules

- Events are immutable once emitted.
- Critical anomalies trigger immediate notifications.
- Events are the only cross-context communication mechanism (INV-CROSS-002).

## Events

- None (this IS an event)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md#7-event-catalog)
