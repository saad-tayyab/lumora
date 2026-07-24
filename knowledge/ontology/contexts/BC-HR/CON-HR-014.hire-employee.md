---
id: CON-HR-014
name: HireEmployee
context: BC-HR
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - commands
---

# HireEmployee

## Definition

A command representing the intent to hire a new employee. When executed, creates an Employee aggregate, assigns department and designation, and emits the EmployeeHired event which triggers user account creation in BC-AUTH.

## Command Payload

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| first_name | string(100) | yes | Employee first name |
| last_name | string(100) | yes | Employee last name |
| email | string(255) | yes | Work email address |
| phone | string(20) | no | Contact phone number |
| hire_date | date | yes | Date of employment commencement |
| department_id | UUID | yes | Reference to Department |
| designation_id | UUID | yes | Reference to Designation |
| manager_id | UUID | no | Reference to direct manager |
| employment_type | enum | yes | Full-time, Part-time, Contract, Intern |
| salary | object | yes | Initial salary details (base_amount, currency, payment_frequency) |

## Execution Flow

1. Validate department and designation exist.
2. Create Employee aggregate.
3. Create initial Salary value object.
4. Emit EmployeeHired event.
5. BC-AUTH creates corresponding User account.

## Invariants

- INV-HR-037: department_id must reference an active Department.
- INV-HR-038: designation_id must reference an active Designation.
- INV-HR-039: Email must be unique across all employees.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
