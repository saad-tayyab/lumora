---
id: CON-INV-006
name: SKU
context: BC-INV
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - identification
  - value-object
---

# SKU

## Definition
A Stock Keeping Unit — an immutable value object representing a unique alphanumeric identifier for a distinct product or item. The SKU is the primary human-readable reference for identifying items across the inventory system.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string(50) | yes | Unique SKU code (e.g., "WH-1000-BLK") |
| barcode | string(100) | no | EAN/UPC barcode value |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | identifies | 1:1 | SKU uniquely identifies an item |

## Invariants
- SKU codes must be unique across the entire tenant.
- SKU codes are immutable once assigned to an item.
- SKU codes cannot be empty or null.

## Business Rules
- None beyond invariants.

## Events
- None.

## References
- [Domain Constitution — Ubiquitous Language](../../constitution/DOMAIN.md#6-ubiquitous-language-glossary-domain-terms)
