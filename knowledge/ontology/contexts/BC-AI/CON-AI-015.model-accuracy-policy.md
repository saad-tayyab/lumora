---
id: CON-AI-015
name: ModelAccuracyPolicy
context: BC-AI
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - model
  - policy
  - quality
---

# ModelAccuracyPolicy

## Definition

A business policy defining minimum accuracy requirements for AI models before they can be deployed to production. Enforces quality gates for model deployment.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| min_accuracy_score | decimal(5,4) | yes | Minimum required accuracy (0.0-1.0) |
| min_training_samples | integer | yes | Minimum training data rows required |
| validation_split | decimal(3,2) | yes | Portion of data for validation |
| cross_validation_folds | integer | no | Number of cross-validation folds |
| max_degradation_pct | decimal(5,2) | yes | Max allowed accuracy drop from previous version |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-005 (AIModel) | enforces | 1:N | Models subject to this policy |

## Invariants

- INV-AI-028: min_accuracy_score must be between 0.0 and 1.0.
- INV-AI-029: validation_split must be between 0.0 and 1.0.
- INV-AI-030: Policy is enforced at model deployment time.

## Business Rules

- Models below minimum accuracy are rejected.
- Accuracy degradation beyond threshold requires review.
- Policy violations block production deployment.

## Events

- PolicyViolation on enforcement failure

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
