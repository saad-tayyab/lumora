---
id: CON-AI-004
name: AnomalyDetection
context: BC-AI
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - anomaly
  - detection
  - monitoring
---

# AnomalyDetection

## Definition

An entity representing the detection of unusual patterns or outliers in business data. Anomaly detection identifies deviations from expected behavior that may indicate errors, fraud, or operational issues.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| model_id | UUID v7 | yes | AI model used for detection |
| data_source | string(200) | yes | Source of analyzed data |
| entity_type | string(100) | yes | Business entity type analyzed |
| entity_id | UUID v7 | yes | Specific entity reference |
| anomaly_score | decimal(5,4) | yes | Anomaly confidence score (0.0-1.0) |
| severity | enum | yes | low, medium, high, critical |
| status | enum | yes | detected, investigating, resolved, dismissed |
| detected_at | timestamp | yes | Detection timestamp |
| tenant_id | UUID v7 | yes | Tenant owner |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-005 (AIModel) | uses | N:1 | Model used for detection |

## Invariants

- INV-AI-007: anomaly_score must be between 0.0 and 1.0.
- INV-AI-008: Severity must be assigned based on anomaly_score thresholds.
- INV-CROSS-003: AnomalyDetection ID is a globally unique UUID v7.

## Business Rules

- High-severity anomalies trigger immediate notifications.
- Dismissed anomalies must include a reason.

## Events

- AnomalyDetected (CON-AI-011)
- AnomalyResolved

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
