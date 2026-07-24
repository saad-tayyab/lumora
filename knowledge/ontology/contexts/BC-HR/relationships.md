---
title: BC-HR Relationships
version: 1.0.0
status: active
context: BC-HR
---

# BC-HR Relationships

## Employee Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | CON-HR-002 (Department) | belongs-to | N:1 | Employee belongs to one department |
| CON-HR-001 (Employee) | CON-HR-003 (Designation) | belongs-to | N:1 | Employee has one designation |
| CON-HR-001 (Employee) | CON-HR-001 (Employee) | has-one | 1:1 | Employee reports to one manager |
| CON-HR-001 (Employee) | CON-HR-004 (Attendance) | has-many | 1:N | Employee has many attendance records |
| CON-HR-001 (Employee) | CON-HR-005 (LeaveRequest) | has-many | 1:N | Employee can submit many leave requests |
| CON-HR-001 (Employee) | CON-HR-009 (Salary) | has-many | 1:N | Employee has salary history |

## Department Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-002 (Department) | CON-HR-001 (Employee) | has-many | 1:N | Department contains many employees |
| CON-HR-002 (Department) | CON-HR-001 (Employee) | has-one | 1:1 | Department has one head |
| CON-HR-002 (Department) | CON-HR-002 (Department) | belongs-to | N:1 | Department may have a parent |

## Designation Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-003 (Designation) | CON-HR-001 (Employee) | has-many | 1:N | Many employees share same designation |

## Attendance Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-004 (Attendance) | CON-HR-001 (Employee) | belongs-to | N:1 | Attendance belongs to one employee |

## LeaveRequest Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-005 (LeaveRequest) | CON-HR-001 (Employee) | belongs-to | N:1 | Leave request belongs to an employee |
| CON-HR-005 (LeaveRequest) | CON-HR-006 (LeaveType) | belongs-to | N:1 | Leave request is for a specific type |
| CON-HR-005 (LeaveRequest) | CON-HR-001 (Employee) | uses | N:1 | Approved by a manager |

## Payroll Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-007 (Payroll) | CON-HR-008 (Payslip) | has-many | 1:N | Payroll produces many payslips |
| CON-HR-007 (Payroll) | CON-HR-001 (Employee) | uses | N:1 | Processed by an employee |

## Payslip Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-008 (Payslip) | CON-HR-007 (Payroll) | belongs-to | N:1 | Payslip belongs to a payroll run |
| CON-HR-008 (Payslip) | CON-HR-001 (Employee) | belongs-to | N:1 | Payslip is for a specific employee |
| CON-HR-008 (Payslip) | CON-HR-009 (Salary) | uses | N:1 | Pay calculated based on salary |

## Event Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-010 (EmployeeHired) | CON-HR-001 (Employee) | triggers | 1:1 | Event triggered by Employee creation |
| CON-HR-010 (EmployeeHired) | BC-AUTH (User) | triggers | 1:1 | Event triggers user account creation |
| CON-HR-011 (LeaveRequested) | CON-HR-005 (LeaveRequest) | triggers | 1:1 | Event triggered by LeaveRequest creation |
| CON-HR-012 (LeaveApproved) | CON-HR-005 (LeaveRequest) | triggers | 1:1 | Event triggered by leave approval |
| CON-HR-013 (PayrollProcessed) | CON-HR-007 (Payroll) | triggers | 1:1 | Event triggered by Payroll completion |

## Policy Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-017 (LeaveApprovalPolicy) | CON-HR-005 (LeaveRequest) | enforces | 1:N | Policy enforces approval rules on leave requests |
| CON-HR-018 (OvertimePolicy) | CON-HR-004 (Attendance) | enforces | 1:N | Policy enforces overtime calculation on attendance |

## Cross-Context Relationships

| Source | Target | Type | Cardinality | Description |
|--------|--------|------|-------------|-------------|
| CON-HR-010 (EmployeeHired) | BC-AUTH | triggers | 1:1 | EVT-005 triggers user creation in BC-AUTH |
