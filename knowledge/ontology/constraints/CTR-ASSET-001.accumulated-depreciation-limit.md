---
id: CTR-ASSET-001
name: Accumulated Depreciation Limit
context: BC-ASSET
type: range
description: "Accumulated depreciation must not exceed depreciable cost"
severity: error
version: 1.0.0
status: active
---

# CTR-ASSET-001: Accumulated Depreciation Limit

## Statement

Accumulated depreciation must not exceed depreciable cost (acquisition cost minus salvage value).

## Rationale

Prevents overstating depreciation expense and ensures assets are not written down below their salvage value, maintaining accurate financial statements.

## Implementation

- Validate at depreciation posting time that `accumulated_depreciation + current_depreciation <= acquisition_cost - salvage_value`.
- Reject or adjust depreciation entries that would breach this limit.
- Log violations for audit review.

## Invariant Reference

- INV-ASSET-003: Accumulated depreciation cannot exceed depreciable cost.

## Business Rule Reference

- BR-012: Accumulated depreciation cannot exceed depreciable cost.
