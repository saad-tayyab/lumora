---
id: CON-INV-008
name: UnitOfMeasure
context: BC-INV
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - inventory
  - measurement
  - reference
---

# UnitOfMeasure

## Definition
An immutable value object representing the unit in which an item is measured, stored, and transacted. Defines the base unit (e.g., "each", "kg", "liter", "box") and optional conversion factors for UOM conversions.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string(10) | yes | Short code (e.g., "EA", "KG", "L", "BOX") |
| name | string(50) | yes | Display name (e.g., "Each", "Kilogram") |
| category | enum | yes | COUNT, WEIGHT, VOLUME, LENGTH, AREA |
| decimal_places | integer | yes | Number of decimal places for fractional quantities |
| base_uom_id | UUID v7 | no | Reference to base UOM for conversions |
| conversion_factor | numeric(19,6) | no | Factor to convert to base UOM |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-INV-001 (Item) | measures | 1:N | UOM measures many items |
| CON-INV-008 (UnitOfMeasure) | self-reference | 0:1 | Base UOM for conversion |

## Invariants
- UOM codes must be globally unique.
- conversion_factor must be > 0.
- decimal_places must be >= 0 and <= 6.

## Business Rules
- None beyond invariants.

## Events
- None.

## References
- [Domain Constitution — BC-INV](../../constitution/DOMAIN.md#3-core-bounded-contexts)
