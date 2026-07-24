---
id: CON-HR-001
name: Employee
context: BC-HR
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - personnel
  - core
---

# Employee

## Definition

The aggregate root representing a person employed by the organization. Encapsulates personal information, employment details, department assignment, designation, and salary information. Serves as the primary entity for HR operations including attendance tracking, leave management, and payroll processing.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| user_id | UUID | no | Reference to BC-AUTH User (set after EmployeeHired event) |
| first_name | string(100) | yes | Employee first name |
| last_name | string(100) | yes | Employee last name |
| email | string(255) | yes | Work email address |
| phone | string(20) | no | Contact phone number |
| hire_date | date | yes | Date of employment commencement |
| department_id | UUID | yes | Reference to Department |
| designation_id | UUID | yes | Reference to Designation |
| manager_id | UUID | no | Reference to Employee (direct manager) |
| employment_type | enum | yes | Full-time, Part-time, Contract, Intern |
| status | enum | yes | Active, OnLeave, Terminated |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-002 (Department) | belongs-to | N:1 | Employee belongs to one department |
| CON-HR-003 (Designation) | belongs-to | N:1 | Employee has one designation |
| CON-HR-001 (Employee) | has-one | 1:1 | Employee reports to one manager |
| CON-HR-004 (Attendance) | has-many | 1:N | Employee has many attendance records |
| CON-HR-005 (LeaveRequest) | has-many | 1:N | Employee can submit many leave requests |
| CON-HR-009 (Salary) | has-one | 1:1 | Employee has one salary record |

## Invariants

- INV-HR-001: Employee must belong to exactly one department.
- INV-HR-002: Employee must have exactly one designation.
- INV-HR-003: Employee status transitions follow defined lifecycle (Active → OnLeave → Active, Active → Terminated).
- INV-CROSS-003: Employee ID is a globally unique UUID v7.

## Business Rules

- BR-006: Leave requests require manager approval (manager referenced via manager_id).

## Events

- EmployeeHired (EVT-005)
- EmployeeTerminated

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Event Catalog - EVT-005](../../../constitution/DOMAIN.md#7-event-catalog)
