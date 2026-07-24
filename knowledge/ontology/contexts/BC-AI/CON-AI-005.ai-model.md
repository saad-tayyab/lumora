---
id: CON-AI-005
name: AIModel
context: BC-AI
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - model
  - machine-learning
---

# AIModel

## Definition

An entity representing a trained machine learning model or rules engine used for predictions, classifications, and anomaly detection within the ERP system.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Model display name |
| model_type | enum | yes | regression, classification, clustering, anomaly, rules |
| version | string(50) | yes | Model version (semver) |
| status | enum | yes | training, active, deprecated, failed |
| accuracy_score | decimal(5,4) | no | Model accuracy (0.0-1.0) |
| training_data_id | UUID v7 | no | Reference to training data |
| config | json | yes | Model configuration parameters |
| tenant_id | UUID v7 | yes | Tenant owner |
| created_at | timestamp | yes | Creation timestamp |
| deployed_at | timestamp | no | Deployment timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-006 (TrainingData) | uses | N:1 | Training data for model |

## Invariants

- INV-AI-009: Model accuracy_score must be between 0.0 and 1.0 when provided.
- INV-AI-010: Only one version of a model can be active at a time.
- INV-CROSS-003: AIModel ID is a globally unique UUID v7.

## Business Rules

- Models must be validated before deployment.
- Deprecated models cannot be used for new predictions.

## Events

- ModelTrained
- ModelDeployed
- ModelDeprecated

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
