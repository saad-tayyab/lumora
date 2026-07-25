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
import * as repo from './repo';
import type {
  ApproveRejectLeaveRequest,
  AttendanceResponse,
  CreateAttendanceRequest,
  CreateDepartmentRequest,
  CreateDesignationRequest,
  CreateEmployeeRequest,
  CreateLeaveRequestRequest,
  CreateLeaveTypeRequest,
  CreatePayrollRequest,
  CreateSalaryRequest,
  DepartmentResponse,
  DesignationResponse,
  EmployeeResponse,
  LeaveRequestResponse,
  LeaveTypeResponse,
  ListAttendanceResponse,
  ListDepartmentsResponse,
  ListDesignationsResponse,
  ListEmployeesResponse,
  ListLeaveRequestsResponse,
  ListLeaveTypesResponse,
  ListPayrollResponse,
  ListPayslipsResponse,
  ListSalariesResponse,
  PaginationParams,
  PayrollResponse,
  PayslipResponse,
  SalaryResponse,
  UpdateAttendanceRequest,
  UpdateDepartmentRequest,
  UpdateDesignationRequest,
  UpdateEmployeeRequest,
  UpdateLeaveTypeRequest,
  UpdatePayrollRequest,
  UpdateSalaryRequest,
} from './types';

// ─── Departments ─────────────────────────────────────────────────────────────

export async function getDepartment(id: string): Promise<DepartmentResponse> {
  const department = await repo.departmentRepo.findById(id);
  if (!department) {
    throw new DepartmentNotFoundError(id);
  }
  return department;
}

export async function listDepartments(
  tenantId: string,
  params: PaginationParams,
): Promise<ListDepartmentsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.departmentRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentRequest,
): Promise<DepartmentResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.departmentRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateDepartmentCodeError(input.code);
  }

  // Validate parent department exists if provided
  if (input.parentId) {
    const parent = await repo.departmentRepo.findById(input.parentId);
    if (!parent) {
      throw new DepartmentNotFoundError(input.parentId);
    }
  }

  // Validate head employee exists if provided
  if (input.headId) {
    const head = await repo.employeeRepo.findById(input.headId);
    if (!head) {
      throw new EmployeeNotFoundError(input.headId);
    }
  }

  const [department] = await repo.departmentRepo.create({
    ...input,
    tenantId,
  });

  return department;
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentRequest,
): Promise<DepartmentResponse> {
  const existing = await repo.departmentRepo.findById(id);
  if (!existing) {
    throw new DepartmentNotFoundError(id);
  }

  // Validate parent department if changing
  if (input.parentId && input.parentId !== existing.parentId) {
    // Prevent circular reference
    if (input.parentId === id) {
      throw new DepartmentNotFoundError(id);
    }
    const parent = await repo.departmentRepo.findById(input.parentId);
    if (!parent) {
      throw new DepartmentNotFoundError(input.parentId);
    }
  }

  // Validate head employee if changing
  if (input.headId && input.headId !== existing.headId) {
    const head = await repo.employeeRepo.findById(input.headId);
    if (!head) {
      throw new EmployeeNotFoundError(input.headId);
    }
  }

  const [updated] = await repo.departmentRepo.update(id, input);
  return updated;
}

export async function deleteDepartment(id: string): Promise<void> {
  const existing = await repo.departmentRepo.findById(id);
  if (!existing) {
    throw new DepartmentNotFoundError(id);
  }

  // Check for child departments
  const children = await repo.departmentRepo.findByParentId(id);
  if (children.length > 0) {
    throw new DepartmentHasChildDepartmentsError(id);
  }

  // Check for associated employees
  const employeeCount = await repo.departmentRepo.countEmployeesByDepartment(id);
  if (employeeCount > 0) {
    throw new DepartmentHasEmployeesError(id);
  }

  await repo.departmentRepo.softDelete(id);
}

// ─── Designations ────────────────────────────────────────────────────────────

export async function getDesignation(id: string): Promise<DesignationResponse> {
  const designation = await repo.designationRepo.findById(id);
  if (!designation) {
    throw new DesignationNotFoundError(id);
  }
  return designation;
}

export async function listDesignations(
  tenantId: string,
  params: PaginationParams,
): Promise<ListDesignationsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.designationRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createDesignation(
  tenantId: string,
  input: CreateDesignationRequest,
): Promise<DesignationResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.designationRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateDesignationCodeError(input.code);
  }

  const [designation] = await repo.designationRepo.create({
    ...input,
    tenantId,
  });

  return designation;
}

export async function updateDesignation(
  id: string,
  input: UpdateDesignationRequest,
): Promise<DesignationResponse> {
  const existing = await repo.designationRepo.findById(id);
  if (!existing) {
    throw new DesignationNotFoundError(id);
  }

  const [updated] = await repo.designationRepo.update(id, input);
  return updated;
}

export async function deleteDesignation(id: string): Promise<void> {
  const existing = await repo.designationRepo.findById(id);
  if (!existing) {
    throw new DesignationNotFoundError(id);
  }

  // Check for associated employees
  const employeeCount = await repo.designationRepo.countEmployeesByDesignation(id);
  if (employeeCount > 0) {
    throw new DesignationHasEmployeesError(id);
  }

  await repo.designationRepo.softDelete(id);
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function getEmployee(id: string): Promise<EmployeeResponse> {
  const employee = await repo.employeeRepo.findById(id);
  if (!employee) {
    throw new EmployeeNotFoundError(id);
  }
  return employee;
}

export async function listEmployees(
  tenantId: string,
  params: PaginationParams,
): Promise<ListEmployeesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.employeeRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createEmployee(
  tenantId: string,
  input: CreateEmployeeRequest,
): Promise<EmployeeResponse> {
  // Check email uniqueness
  const existingEmail = await repo.employeeRepo.findByEmail(input.email);
  if (existingEmail) {
    throw new DuplicateEmployeeEmailError(input.email);
  }

  // Validate department exists
  const department = await repo.departmentRepo.findById(input.departmentId);
  if (!department) {
    throw new DepartmentNotFoundError(input.departmentId);
  }

  // Validate designation exists
  const designation = await repo.designationRepo.findById(input.designationId);
  if (!designation) {
    throw new DesignationNotFoundError(input.designationId);
  }

  // Validate manager exists if provided
  if (input.managerId) {
    const manager = await repo.employeeRepo.findById(input.managerId);
    if (!manager) {
      throw new EmployeeNotFoundError(input.managerId);
    }
  }

  const [employee] = await repo.employeeRepo.create({
    ...input,
    tenantId,
  });

  return employee;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeRequest,
): Promise<EmployeeResponse> {
  const existing = await repo.employeeRepo.findById(id);
  if (!existing) {
    throw new EmployeeNotFoundError(id);
  }

  // Check email uniqueness if changing
  if (input.email && input.email !== existing.email) {
    const existingEmail = await repo.employeeRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new DuplicateEmployeeEmailError(input.email);
    }
  }

  // Validate department if changing
  if (input.departmentId && input.departmentId !== existing.departmentId) {
    const department = await repo.departmentRepo.findById(input.departmentId);
    if (!department) {
      throw new DepartmentNotFoundError(input.departmentId);
    }
  }

  // Validate designation if changing
  if (input.designationId && input.designationId !== existing.designationId) {
    const designation = await repo.designationRepo.findById(input.designationId);
    if (!designation) {
      throw new DesignationNotFoundError(input.designationId);
    }
  }

  // Validate manager if changing
  if (input.managerId && input.managerId !== existing.managerId) {
    // Prevent self-referencing manager
    if (input.managerId === id) {
      throw new EmployeeNotFoundError(id);
    }
    const manager = await repo.employeeRepo.findById(input.managerId);
    if (!manager) {
      throw new EmployeeNotFoundError(input.managerId);
    }
  }

  const [updated] = await repo.employeeRepo.update(id, input);
  return updated;
}

export async function deleteEmployee(id: string): Promise<void> {
  const existing = await repo.employeeRepo.findById(id);
  if (!existing) {
    throw new EmployeeNotFoundError(id);
  }

  await repo.employeeRepo.softDelete(id);
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export async function getAttendance(id: string): Promise<AttendanceResponse> {
  const record = await repo.attendanceRepo.findById(id);
  if (!record) {
    throw new AttendanceNotFoundError(id);
  }
  return record;
}

export async function listAttendance(
  tenantId: string,
  params: PaginationParams,
): Promise<ListAttendanceResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.attendanceRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createAttendance(
  tenantId: string,
  input: CreateAttendanceRequest,
): Promise<AttendanceResponse> {
  // Validate employee exists
  const employee = await repo.employeeRepo.findById(input.employeeId);
  if (!employee) {
    throw new EmployeeNotFoundError(input.employeeId);
  }

  // Check for duplicate attendance record on same date
  const existing = await repo.attendanceRepo.findByEmployeeAndDate(input.employeeId, input.date);
  if (existing) {
    throw new DuplicateAttendanceRecordError(input.employeeId, input.date);
  }

  const [record] = await repo.attendanceRepo.create({
    ...input,
    tenantId,
  });

  return record;
}

export async function updateAttendance(
  id: string,
  input: UpdateAttendanceRequest,
): Promise<AttendanceResponse> {
  const existing = await repo.attendanceRepo.findById(id);
  if (!existing) {
    throw new AttendanceNotFoundError(id);
  }

  const [updated] = await repo.attendanceRepo.update(id, input);
  return updated;
}

export async function deleteAttendance(id: string): Promise<void> {
  const existing = await repo.attendanceRepo.findById(id);
  if (!existing) {
    throw new AttendanceNotFoundError(id);
  }

  await repo.attendanceRepo.delete(id);
}

// ─── Leave Types ─────────────────────────────────────────────────────────────

export async function getLeaveType(id: string): Promise<LeaveTypeResponse> {
  const leaveType = await repo.leaveTypeRepo.findById(id);
  if (!leaveType) {
    throw new LeaveTypeNotFoundError(id);
  }
  return leaveType;
}

export async function listLeaveTypes(
  tenantId: string,
  params: PaginationParams,
): Promise<ListLeaveTypesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.leaveTypeRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createLeaveType(
  tenantId: string,
  input: CreateLeaveTypeRequest,
): Promise<LeaveTypeResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.leaveTypeRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateLeaveTypeCodeError(input.code);
  }

  const [leaveType] = await repo.leaveTypeRepo.create({
    ...input,
    tenantId,
  });

  return leaveType;
}

export async function updateLeaveType(
  id: string,
  input: UpdateLeaveTypeRequest,
): Promise<LeaveTypeResponse> {
  const existing = await repo.leaveTypeRepo.findById(id);
  if (!existing) {
    throw new LeaveTypeNotFoundError(id);
  }

  const [updated] = await repo.leaveTypeRepo.update(id, input);
  return updated;
}

export async function deleteLeaveType(id: string): Promise<void> {
  const existing = await repo.leaveTypeRepo.findById(id);
  if (!existing) {
    throw new LeaveTypeNotFoundError(id);
  }

  // Check for associated leave requests
  const requestCount = await repo.leaveTypeRepo.countRequestsByLeaveType(id);
  if (requestCount > 0) {
    throw new LeaveTypeHasRequestsError(id);
  }

  await repo.leaveTypeRepo.softDelete(id);
}

// ─── Leave Requests ──────────────────────────────────────────────────────────

export async function getLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const request = await repo.leaveRequestRepo.findById(id);
  if (!request) {
    throw new LeaveRequestNotFoundError(id);
  }
  return request;
}

export async function listLeaveRequests(
  tenantId: string,
  params: PaginationParams,
): Promise<ListLeaveRequestsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.leaveRequestRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Creates a leave request.
 *
 * Enforces:
 * - BR-006: Leave requests require manager approval (validates employee has a manager)
 * - End date must be on or after start date
 * - Total days must be positive
 * - Employee must exist and be active
 * - Leave type must exist and be active
 */
export async function createLeaveRequest(
  tenantId: string,
  input: CreateLeaveRequestRequest,
): Promise<LeaveRequestResponse> {
  // Validate employee exists and is active
  const employee = await repo.employeeRepo.findById(input.employeeId);
  if (!employee) {
    throw new EmployeeNotFoundError(input.employeeId);
  }
  if (employee.status !== 'active') {
    throw new EmployeeNotActiveError(input.employeeId);
  }

  // BR-006: Leave requests require manager approval — employee must have a manager
  if (!employee.managerId) {
    throw new LeaveRequestRequiresManagerError(input.employeeId);
  }

  // Validate leave type exists
  const leaveType = await repo.leaveTypeRepo.findById(input.leaveTypeId);
  if (!leaveType) {
    throw new LeaveTypeNotFoundError(input.leaveTypeId);
  }

  // Validate date range
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate < startDate) {
    throw new InvalidLeaveDateRangeError();
  }

  // Validate total days
  if (input.totalDays <= 0) {
    throw new InvalidLeaveDaysError();
  }

  const [request] = await repo.leaveRequestRepo.create({
    ...input,
    tenantId,
    status: 'pending',
  });

  return request;
}

/**
 * Approves or rejects a leave request.
 *
 * Enforces:
 * - BR-006: Only the employee's manager can approve/reject leave requests
 * - Cannot modify already processed requests
 */
export async function approveRejectLeaveRequest(
  id: string,
  approverUserId: string,
  input: ApproveRejectLeaveRequest,
): Promise<LeaveRequestResponse> {
  const request = await repo.leaveRequestRepo.findById(id);
  if (!request) {
    throw new LeaveRequestNotFoundError(id);
  }

  // Cannot modify already processed requests
  if (request.status !== 'pending') {
    throw new LeaveRequestAlreadyProcessedError(id, request.status);
  }

  // BR-006: Only the employee's manager can approve/reject
  const employee = await repo.employeeRepo.findById(request.employeeId);
  if (!employee) {
    throw new EmployeeNotFoundError(request.employeeId);
  }

  // Verify the approver is the employee's manager
  if (employee.managerId !== approverUserId) {
    throw new NotAuthorizedForLeaveApprovalError();
  }

  const updateData: {
    status: 'approved' | 'rejected';
    approvedBy: string;
    approvedAt: Date;
    rejectionReason?: string;
  } = {
    status: input.status,
    approvedBy: approverUserId,
    approvedAt: new Date(),
  };

  if (input.status === 'rejected' && input.rejectionReason) {
    updateData.rejectionReason = input.rejectionReason;
  }

  const [updated] = await repo.leaveRequestRepo.update(id, updateData);
  return updated;
}

// ─── Salaries ────────────────────────────────────────────────────────────────

export async function getSalary(id: string): Promise<SalaryResponse> {
  const salary = await repo.salaryRepo.findById(id);
  if (!salary) {
    throw new SalaryNotFoundError(id);
  }
  return salary;
}

export async function listSalaries(
  tenantId: string,
  params: PaginationParams,
): Promise<ListSalariesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.salaryRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createSalary(
  tenantId: string,
  input: CreateSalaryRequest,
): Promise<SalaryResponse> {
  // Validate employee exists
  const employee = await repo.employeeRepo.findById(input.employeeId);
  if (!employee) {
    throw new EmployeeNotFoundError(input.employeeId);
  }

  // Check if employee already has an active salary
  const existingSalary = await repo.salaryRepo.findByEmployee(input.employeeId);
  if (existingSalary) {
    throw new EmployeeAlreadyHasSalaryError(input.employeeId);
  }

  const [salary] = await repo.salaryRepo.create({
    ...input,
    tenantId,
  });

  return salary;
}

export async function updateSalary(
  id: string,
  input: UpdateSalaryRequest,
): Promise<SalaryResponse> {
  const existing = await repo.salaryRepo.findById(id);
  if (!existing) {
    throw new SalaryNotFoundError(id);
  }

  const [updated] = await repo.salaryRepo.update(id, input);
  return updated;
}

export async function deleteSalary(id: string): Promise<void> {
  const existing = await repo.salaryRepo.findById(id);
  if (!existing) {
    throw new SalaryNotFoundError(id);
  }

  await repo.salaryRepo.softDelete(id);
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

export async function getPayroll(id: string): Promise<PayrollResponse> {
  const record = await repo.payrollRepo.findById(id);
  if (!record) {
    throw new PayrollNotFoundError(id);
  }
  return record;
}

export async function listPayroll(
  tenantId: string,
  params: PaginationParams,
): Promise<ListPayrollResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.payrollRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createPayroll(
  tenantId: string,
  input: CreatePayrollRequest,
): Promise<PayrollResponse> {
  // Validate employee exists and is active
  const employee = await repo.employeeRepo.findById(input.employeeId);
  if (!employee) {
    throw new EmployeeNotFoundError(input.employeeId);
  }
  if (employee.status !== 'active') {
    throw new EmployeeNotActiveError(input.employeeId);
  }

  // Validate pay period
  const periodStart = new Date(input.payPeriodStart);
  const periodEnd = new Date(input.payPeriodEnd);
  if (periodEnd < periodStart) {
    throw new PayrollInvalidPeriodError();
  }

  // Check for duplicate payroll for same employee and period
  const existing = await repo.payrollRepo.findByEmployeeAndPeriod(
    input.employeeId,
    input.payPeriodStart,
    input.payPeriodEnd,
  );
  if (existing) {
    throw new PayrollAlreadyProcessedError(existing.id);
  }

  // Calculate net pay
  const basicSalary = Number(input.basicSalary);
  const allowances = Number(input.allowances ?? '0');
  const deductions = Number(input.deductions ?? '0');
  const netPay = basicSalary + allowances - deductions;

  const [record] = await repo.payrollRepo.create({
    ...input,
    tenantId,
    netPay: String(netPay),
    status: 'draft',
  });

  return record;
}

export async function updatePayroll(
  id: string,
  input: UpdatePayrollRequest,
): Promise<PayrollResponse> {
  const existing = await repo.payrollRepo.findById(id);
  if (!existing) {
    throw new PayrollNotFoundError(id);
  }

  // Recalculate net pay if any amount changed
  const basicSalary = Number(input.basicSalary ?? existing.basicSalary);
  const allowances = Number(input.allowances ?? existing.allowances);
  const deductions = Number(input.deductions ?? existing.deductions);
  const netPay = basicSalary + allowances - deductions;

  const [updated] = await repo.payrollRepo.update(id, {
    ...input,
    netPay: String(netPay),
  });
  return updated;
}

export async function processPayroll(id: string): Promise<PayrollResponse> {
  const existing = await repo.payrollRepo.findById(id);
  if (!existing) {
    throw new PayrollNotFoundError(id);
  }

  if (existing.status !== 'draft') {
    throw new PayrollAlreadyProcessedError(id);
  }

  const [updated] = await repo.payrollRepo.update(id, {
    status: 'processed',
    processedAt: new Date(),
  });
  return updated;
}

export async function deletePayroll(id: string): Promise<void> {
  const existing = await repo.payrollRepo.findById(id);
  if (!existing) {
    throw new PayrollNotFoundError(id);
  }

  await repo.payrollRepo.softDelete(id);
}

// ─── Payslips ────────────────────────────────────────────────────────────────

export async function getPayslip(id: string): Promise<PayslipResponse> {
  const payslip = await repo.payslipRepo.findById(id);
  if (!payslip) {
    throw new PayrollNotFoundError(id);
  }
  return payslip;
}

export async function listPayslips(
  tenantId: string,
  params: PaginationParams,
): Promise<ListPayslipsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.payslipRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
