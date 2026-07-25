import { AppError } from '../../lib/errors';

// ─── Department Errors ──────────────────────────────────────────────────────

export class DepartmentNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Department with id '${id}' not found`, 404);
  }
}

export class DuplicateDepartmentCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Department with code '${code}' already exists`, 409);
  }
}

export class DepartmentHasEmployeesError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Department '${id}' has associated employees and cannot be deleted`, 409);
  }
}

export class DepartmentHasChildDepartmentsError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Department '${id}' has child departments and cannot be deleted`, 409);
  }
}

// ─── Designation Errors ────────────────────────────────────────────────────

export class DesignationNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Designation with id '${id}' not found`, 404);
  }
}

export class DuplicateDesignationCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Designation with code '${code}' already exists`, 409);
  }
}

export class DesignationHasEmployeesError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Designation '${id}' has associated employees and cannot be deleted`, 409);
  }
}

// ─── Employee Errors ───────────────────────────────────────────────────────

export class EmployeeNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Employee with id '${id}' not found`, 404);
  }
}

export class DuplicateEmployeeEmailError extends AppError {
  constructor(email: string) {
    super('CONFLICT', `Employee with email '${email}' already exists`, 409);
  }
}

// ─── Attendance Errors ─────────────────────────────────────────────────────

export class AttendanceNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Attendance record with id '${id}' not found`, 404);
  }
}

export class DuplicateAttendanceRecordError extends AppError {
  constructor(employeeId: string, date: string) {
    super(
      'CONFLICT',
      `Attendance record for employee '${employeeId}' on '${date}' already exists`,
      409,
    );
  }
}

// ─── Leave Type Errors ─────────────────────────────────────────────────────

export class LeaveTypeNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Leave type with id '${id}' not found`, 404);
  }
}

export class DuplicateLeaveTypeCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Leave type with code '${code}' already exists`, 409);
  }
}

export class LeaveTypeHasRequestsError extends AppError {
  constructor(id: string) {
    super(
      'CONFLICT',
      `Leave type '${id}' has associated leave requests and cannot be deleted`,
      409,
    );
  }
}

// ─── Leave Request Errors ──────────────────────────────────────────────────

export class LeaveRequestNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Leave request with id '${id}' not found`, 404);
  }
}

/**
 * BR-006: Leave requests require manager approval.
 */
export class LeaveRequestRequiresManagerError extends AppError {
  constructor(employeeId: string) {
    super(
      'VALIDATION_ERROR',
      `Employee '${employeeId}' does not have a manager assigned for leave approval`,
      400,
    );
  }
}

/**
 * BR-006: Only the employee's manager can approve/reject leave requests.
 */
export class NotAuthorizedForLeaveApprovalError extends AppError {
  constructor() {
    super('FORBIDDEN', 'Only the assigned manager can approve or reject this leave request', 403);
  }
}

/**
 * Leave request cannot be approved/rejected if already in a terminal state.
 */
export class LeaveRequestAlreadyProcessedError extends AppError {
  constructor(id: string, currentStatus: string) {
    super(
      'CONFLICT',
      `Leave request '${id}' has already been ${currentStatus} and cannot be modified`,
      409,
    );
  }
}

/**
 * Leave request end date must be on or after start date.
 */
export class InvalidLeaveDateRangeError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Leave end date must be on or after the start date', 400);
  }
}

/**
 * Leave request total days must be positive.
 */
export class InvalidLeaveDaysError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Total leave days must be a positive integer', 400);
  }
}

// ─── Salary Errors ────────────────────────────────────────────────────────

export class SalaryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Salary record with id '${id}' not found`, 404);
  }
}

export class EmployeeAlreadyHasSalaryError extends AppError {
  constructor(employeeId: string) {
    super('CONFLICT', `Employee '${employeeId}' already has an active salary record`, 409);
  }
}

// ─── Payroll Errors ───────────────────────────────────────────────────────

export class PayrollNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Payroll record with id '${id}' not found`, 404);
  }
}

export class PayrollAlreadyProcessedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Payroll record '${id}' has already been processed`, 409);
  }
}

export class PayrollInvalidPeriodError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Pay period start date must be before end date', 400);
  }
}

export class EmployeeNotActiveError extends AppError {
  constructor(employeeId: string) {
    super(
      'VALIDATION_ERROR',
      `Employee '${employeeId}' is not active and cannot be included in payroll`,
      400,
    );
  }
}
