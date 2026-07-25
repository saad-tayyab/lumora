import { describe, expect, it, vi } from 'vitest';

// ─── Mock encore.dev/api (required to avoid runtime env error) ─────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(
      code: string,
      message: string,
      opts?: { status?: number; details?: Record<string, string[]> },
    ) {
      super(message);
      this.name = 'APIError';
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
  },
  api: vi.fn(),
}));

// ─── Import Errors After Mocking ───────────────────────────────────────────

import {
  AttendanceNotFoundError,
  DepartmentHasChildDepartmentsError,
  DepartmentHasEmployeesError,
  DepartmentNotFoundError,
  DesignationHasEmployeesError,
  DesignationNotFoundError,
  DuplicateAttendanceRecordError,
  DuplicateDepartmentCodeError,
  DuplicateDesignationCodeError,
  DuplicateEmployeeEmailError,
  DuplicateLeaveTypeCodeError,
  EmployeeAlreadyHasSalaryError,
  EmployeeNotActiveError,
  EmployeeNotFoundError,
  InvalidLeaveDateRangeError,
  InvalidLeaveDaysError,
  LeaveRequestAlreadyProcessedError,
  LeaveRequestNotFoundError,
  LeaveRequestRequiresManagerError,
  LeaveTypeHasRequestsError,
  LeaveTypeNotFoundError,
  NotAuthorizedForLeaveApprovalError,
  PayrollAlreadyProcessedError,
  PayrollInvalidPeriodError,
  PayrollNotFoundError,
  SalaryNotFoundError,
} from './errors';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('HR Errors', () => {
  // ─── Department Errors ────────────────────────────────────────────────

  describe('DepartmentNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new DepartmentNotFoundError('dept-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new DepartmentNotFoundError('dept-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new DepartmentNotFoundError('dept-1');
      expect(error.message).toContain('dept-1');
    });

    it('should have a descriptive message', () => {
      const error = new DepartmentNotFoundError('dept-1');
      expect(error.message).toBe("Department with id 'dept-1' not found");
    });
  });

  describe('DuplicateDepartmentCodeError', () => {
    it('should have CONFLICT code', () => {
      const error = new DuplicateDepartmentCodeError('ENG');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DuplicateDepartmentCodeError('ENG');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new DuplicateDepartmentCodeError('ENG');
      expect(error.message).toContain('ENG');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateDepartmentCodeError('ENG');
      expect(error.message).toBe("Department with code 'ENG' already exists");
    });
  });

  describe('DepartmentHasEmployeesError', () => {
    it('should have CONFLICT code', () => {
      const error = new DepartmentHasEmployeesError('dept-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DepartmentHasEmployeesError('dept-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new DepartmentHasEmployeesError('dept-1');
      expect(error.message).toContain('dept-1');
    });

    it('should have a descriptive message', () => {
      const error = new DepartmentHasEmployeesError('dept-1');
      expect(error.message).toBe(
        "Department 'dept-1' has associated employees and cannot be deleted",
      );
    });
  });

  describe('DepartmentHasChildDepartmentsError', () => {
    it('should have CONFLICT code', () => {
      const error = new DepartmentHasChildDepartmentsError('dept-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DepartmentHasChildDepartmentsError('dept-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new DepartmentHasChildDepartmentsError('dept-1');
      expect(error.message).toContain('dept-1');
    });

    it('should have a descriptive message', () => {
      const error = new DepartmentHasChildDepartmentsError('dept-1');
      expect(error.message).toBe("Department 'dept-1' has child departments and cannot be deleted");
    });
  });

  // ─── Designation Errors ──────────────────────────────────────────────

  describe('DesignationNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new DesignationNotFoundError('desig-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new DesignationNotFoundError('desig-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new DesignationNotFoundError('desig-1');
      expect(error.message).toContain('desig-1');
    });

    it('should have a descriptive message', () => {
      const error = new DesignationNotFoundError('desig-1');
      expect(error.message).toBe("Designation with id 'desig-1' not found");
    });
  });

  describe('DuplicateDesignationCodeError', () => {
    it('should have CONFLICT code', () => {
      const error = new DuplicateDesignationCodeError('SR-ENG');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DuplicateDesignationCodeError('SR-ENG');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new DuplicateDesignationCodeError('SR-ENG');
      expect(error.message).toContain('SR-ENG');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateDesignationCodeError('SR-ENG');
      expect(error.message).toBe("Designation with code 'SR-ENG' already exists");
    });
  });

  describe('DesignationHasEmployeesError', () => {
    it('should have CONFLICT code', () => {
      const error = new DesignationHasEmployeesError('desig-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DesignationHasEmployeesError('desig-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new DesignationHasEmployeesError('desig-1');
      expect(error.message).toContain('desig-1');
    });

    it('should have a descriptive message', () => {
      const error = new DesignationHasEmployeesError('desig-1');
      expect(error.message).toBe(
        "Designation 'desig-1' has associated employees and cannot be deleted",
      );
    });
  });

  // ─── Employee Errors ─────────────────────────────────────────────────

  describe('EmployeeNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new EmployeeNotFoundError('emp-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new EmployeeNotFoundError('emp-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new EmployeeNotFoundError('emp-1');
      expect(error.message).toContain('emp-1');
    });

    it('should have a descriptive message', () => {
      const error = new EmployeeNotFoundError('emp-1');
      expect(error.message).toBe("Employee with id 'emp-1' not found");
    });
  });

  describe('DuplicateEmployeeEmailError', () => {
    it('should have CONFLICT code', () => {
      const error = new DuplicateEmployeeEmailError('john@example.com');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DuplicateEmployeeEmailError('john@example.com');
      expect(error.status).toBe(409);
    });

    it('should include the email in the message', () => {
      const error = new DuplicateEmployeeEmailError('john@example.com');
      expect(error.message).toContain('john@example.com');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateEmployeeEmailError('john@example.com');
      expect(error.message).toBe("Employee with email 'john@example.com' already exists");
    });
  });

  // ─── Attendance Errors ───────────────────────────────────────────────

  describe('AttendanceNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new AttendanceNotFoundError('att-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new AttendanceNotFoundError('att-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new AttendanceNotFoundError('att-1');
      expect(error.message).toContain('att-1');
    });

    it('should have a descriptive message', () => {
      const error = new AttendanceNotFoundError('att-1');
      expect(error.message).toBe("Attendance record with id 'att-1' not found");
    });
  });

  describe('DuplicateAttendanceRecordError', () => {
    it('should have CONFLICT code', () => {
      const error = new DuplicateAttendanceRecordError('emp-1', '2026-07-15');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DuplicateAttendanceRecordError('emp-1', '2026-07-15');
      expect(error.status).toBe(409);
    });

    it('should include employee id and date in the message', () => {
      const error = new DuplicateAttendanceRecordError('emp-1', '2026-07-15');
      expect(error.message).toContain('emp-1');
      expect(error.message).toContain('2026-07-15');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateAttendanceRecordError('emp-1', '2026-07-15');
      expect(error.message).toBe(
        "Attendance record for employee 'emp-1' on '2026-07-15' already exists",
      );
    });
  });

  // ─── Leave Type Errors ───────────────────────────────────────────────

  describe('LeaveTypeNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new LeaveTypeNotFoundError('lt-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new LeaveTypeNotFoundError('lt-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new LeaveTypeNotFoundError('lt-1');
      expect(error.message).toContain('lt-1');
    });

    it('should have a descriptive message', () => {
      const error = new LeaveTypeNotFoundError('lt-1');
      expect(error.message).toBe("Leave type with id 'lt-1' not found");
    });
  });

  describe('DuplicateLeaveTypeCodeError', () => {
    it('should have CONFLICT code', () => {
      const error = new DuplicateLeaveTypeCodeError('AL');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new DuplicateLeaveTypeCodeError('AL');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new DuplicateLeaveTypeCodeError('AL');
      expect(error.message).toContain('AL');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateLeaveTypeCodeError('AL');
      expect(error.message).toBe("Leave type with code 'AL' already exists");
    });
  });

  describe('LeaveTypeHasRequestsError', () => {
    it('should have CONFLICT code', () => {
      const error = new LeaveTypeHasRequestsError('lt-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new LeaveTypeHasRequestsError('lt-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new LeaveTypeHasRequestsError('lt-1');
      expect(error.message).toContain('lt-1');
    });

    it('should have a descriptive message', () => {
      const error = new LeaveTypeHasRequestsError('lt-1');
      expect(error.message).toBe(
        "Leave type 'lt-1' has associated leave requests and cannot be deleted",
      );
    });
  });

  // ─── Leave Request Errors ────────────────────────────────────────────

  describe('LeaveRequestNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new LeaveRequestNotFoundError('lr-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new LeaveRequestNotFoundError('lr-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new LeaveRequestNotFoundError('lr-1');
      expect(error.message).toContain('lr-1');
    });

    it('should have a descriptive message', () => {
      const error = new LeaveRequestNotFoundError('lr-1');
      expect(error.message).toBe("Leave request with id 'lr-1' not found");
    });
  });

  describe('LeaveRequestRequiresManagerError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new LeaveRequestRequiresManagerError('emp-1');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status', () => {
      const error = new LeaveRequestRequiresManagerError('emp-1');
      expect(error.status).toBe(400);
    });

    it('should include the employee id in the message', () => {
      const error = new LeaveRequestRequiresManagerError('emp-1');
      expect(error.message).toContain('emp-1');
    });

    it('should have a descriptive message', () => {
      const error = new LeaveRequestRequiresManagerError('emp-1');
      expect(error.message).toBe(
        "Employee 'emp-1' does not have a manager assigned for leave approval",
      );
    });
  });

  describe('NotAuthorizedForLeaveApprovalError', () => {
    it('should have FORBIDDEN code', () => {
      const error = new NotAuthorizedForLeaveApprovalError();
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should have 403 status', () => {
      const error = new NotAuthorizedForLeaveApprovalError();
      expect(error.status).toBe(403);
    });

    it('should have a descriptive message', () => {
      const error = new NotAuthorizedForLeaveApprovalError();
      expect(error.message).toBe(
        'Only the assigned manager can approve or reject this leave request',
      );
    });
  });

  describe('LeaveRequestAlreadyProcessedError', () => {
    it('should have CONFLICT code', () => {
      const error = new LeaveRequestAlreadyProcessedError('lr-1', 'approved');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new LeaveRequestAlreadyProcessedError('lr-1', 'approved');
      expect(error.status).toBe(409);
    });

    it('should include the id and status in the message', () => {
      const error = new LeaveRequestAlreadyProcessedError('lr-1', 'approved');
      expect(error.message).toContain('lr-1');
      expect(error.message).toContain('approved');
    });

    it('should have a descriptive message', () => {
      const error = new LeaveRequestAlreadyProcessedError('lr-1', 'rejected');
      expect(error.message).toBe(
        "Leave request 'lr-1' has already been rejected and cannot be modified",
      );
    });
  });

  describe('InvalidLeaveDateRangeError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new InvalidLeaveDateRangeError();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status', () => {
      const error = new InvalidLeaveDateRangeError();
      expect(error.status).toBe(400);
    });

    it('should have a descriptive message', () => {
      const error = new InvalidLeaveDateRangeError();
      expect(error.message).toBe('Leave end date must be on or after the start date');
    });
  });

  describe('InvalidLeaveDaysError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new InvalidLeaveDaysError();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status', () => {
      const error = new InvalidLeaveDaysError();
      expect(error.status).toBe(400);
    });

    it('should have a descriptive message', () => {
      const error = new InvalidLeaveDaysError();
      expect(error.message).toBe('Total leave days must be a positive integer');
    });
  });

  // ─── Salary Errors ───────────────────────────────────────────────────

  describe('SalaryNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new SalaryNotFoundError('sal-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new SalaryNotFoundError('sal-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new SalaryNotFoundError('sal-1');
      expect(error.message).toContain('sal-1');
    });

    it('should have a descriptive message', () => {
      const error = new SalaryNotFoundError('sal-1');
      expect(error.message).toBe("Salary record with id 'sal-1' not found");
    });
  });

  describe('EmployeeAlreadyHasSalaryError', () => {
    it('should have CONFLICT code', () => {
      const error = new EmployeeAlreadyHasSalaryError('emp-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new EmployeeAlreadyHasSalaryError('emp-1');
      expect(error.status).toBe(409);
    });

    it('should include the employee id in the message', () => {
      const error = new EmployeeAlreadyHasSalaryError('emp-1');
      expect(error.message).toContain('emp-1');
    });

    it('should have a descriptive message', () => {
      const error = new EmployeeAlreadyHasSalaryError('emp-1');
      expect(error.message).toBe("Employee 'emp-1' already has an active salary record");
    });
  });

  // ─── Payroll Errors ──────────────────────────────────────────────────

  describe('PayrollNotFoundError', () => {
    it('should have NOT_FOUND code', () => {
      const error = new PayrollNotFoundError('pay-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have 404 status', () => {
      const error = new PayrollNotFoundError('pay-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new PayrollNotFoundError('pay-1');
      expect(error.message).toContain('pay-1');
    });

    it('should have a descriptive message', () => {
      const error = new PayrollNotFoundError('pay-1');
      expect(error.message).toBe("Payroll record with id 'pay-1' not found");
    });
  });

  describe('PayrollAlreadyProcessedError', () => {
    it('should have CONFLICT code', () => {
      const error = new PayrollAlreadyProcessedError('pay-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have 409 status', () => {
      const error = new PayrollAlreadyProcessedError('pay-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new PayrollAlreadyProcessedError('pay-1');
      expect(error.message).toContain('pay-1');
    });

    it('should have a descriptive message', () => {
      const error = new PayrollAlreadyProcessedError('pay-1');
      expect(error.message).toBe("Payroll record 'pay-1' has already been processed");
    });
  });

  describe('PayrollInvalidPeriodError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new PayrollInvalidPeriodError();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status', () => {
      const error = new PayrollInvalidPeriodError();
      expect(error.status).toBe(400);
    });

    it('should have a descriptive message', () => {
      const error = new PayrollInvalidPeriodError();
      expect(error.message).toBe('Pay period start date must be before end date');
    });
  });

  describe('EmployeeNotActiveError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new EmployeeNotActiveError('emp-1');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status', () => {
      const error = new EmployeeNotActiveError('emp-1');
      expect(error.status).toBe(400);
    });

    it('should include the employee id in the message', () => {
      const error = new EmployeeNotActiveError('emp-1');
      expect(error.message).toContain('emp-1');
    });

    it('should have a descriptive message', () => {
      const error = new EmployeeNotActiveError('emp-1');
      expect(error.message).toBe(
        "Employee 'emp-1' is not active and cannot be included in payroll",
      );
    });
  });
});
