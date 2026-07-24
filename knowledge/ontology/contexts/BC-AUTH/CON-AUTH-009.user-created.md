---
id: CON-AUTH-009
name: UserCreated
context: BC-AUTH
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - event
  - user-lifecycle
---

# UserCreated

## Definition

A domain event emitted when a new user account is successfully created. This event triggers downstream processes such as sending a verification email and initializing default roles.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| user_id | UUID v7 | yes | ID of the newly created user |
| email | string(255) | yes | User's email address |
| name | string(100) | yes | User's display name |
| tenant_id | UUID v7 | yes | Tenant the user belongs to |
| timestamp | timestamp | yes | When the event occurred |
| correlation_id | UUID v7 | no | Correlation ID for tracing |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | triggers | 1:1 | Event is triggered by user creation |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.

## Business Rules

- UserCreated event must be published to the event bus.
- Downstream consumers must be idempotent.

## Events

- This is itself an event.

## References

- [Domain Constitution — Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
