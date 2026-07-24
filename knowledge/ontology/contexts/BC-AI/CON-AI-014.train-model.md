---
id: CON-AI-014
name: TrainModel
context: BC-AI
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - model
  - training
  - command
---

# TrainModel

## Definition

A command representing the intent to train a new AI model version using specified training data. Encapsulates model configuration and data source.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| model_name | string(200) | yes | Model display name |
| model_type | enum | yes | regression, classification, clustering, anomaly, rules |
| training_data | TrainingData | yes | Training data configuration |
| config | json | yes | Model hyperparameters and configuration |
| tenant_id | UUID v7 | yes | Tenant owner |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-005 (AIModel) | creates | 1:1 | Model to be trained |
| CON-AI-006 (TrainingData) | uses | 1:1 | Data for training |

## Invariants

- INV-AI-026: Training data must be validated before training.
- INV-AI-027: Model type must be compatible with training data.

## Business Rules

- Training runs asynchronously.
- Model version is auto-incremented on successful training.
- Training data quality must meet minimum threshold.

## Events

- ModelTrained on success
- ModelTrainingFailed on failure

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
