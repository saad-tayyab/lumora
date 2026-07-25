import type {
  AttendanceRecord,
  Department,
  Designation,
  Employee,
  LeaveRequest,
  LeaveType,
  NewAttendanceRecord,
  NewDepartment,
  NewDesignation,
  NewEmployee,
  NewLeaveRequest,
  NewLeaveType,
  NewPayrollRecord,
  NewPayslip,
  NewSalary,
  PayrollRecord,
  Payslip,
  Salary,
} from '@lumora/database/schema/hr';

// ─── Re-export Domain Types ───────────────────────────────────────────────────

export type {
  AttendanceRecord,
  Department,
  Designation,
  Employee,
  LeaveRequest,
  LeaveType,
  NewAttendanceRecord,
  NewDepartment,
  NewDesignation,
  NewEmployee,
  NewLeaveRequest,
  NewLeaveType,
  NewPayrollRecord,
  NewPayslip,
  NewSalary,
  PayrollRecord,
  Payslip,
  Salary,
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Department Types ─────────────────────────────────────────────────────────

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentId?: string;
  status?: Department['status'];
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  headId?: string | null;
  parentId?: string | null;
  status?: Department['status'];
}

export type DepartmentResponse = Department;
export type ListDepartmentsResponse = PaginatedResponse<DepartmentResponse>;

// ─── Designation Types ────────────────────────────────────────────────────────

export interface CreateDesignationRequest {
  name: string;
  code: string;
  description?: string;
  level?: number;
  salaryBandMin?: string;
  salaryBandMax?: string;
  isActive?: boolean;
}

export interface UpdateDesignationRequest {
  name?: string;
  description?: string;
  level?: number;
  salaryBandMin?: string | null;
  salaryBandMax?: string | null;
  isActive?: boolean;
}

export type DesignationResponse = Designation;
export type ListDesignationsResponse = PaginatedResponse<DesignationResponse>;

// ─── Employee Types ───────────────────────────────────────────────────────────

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hireDate: string;
  departmentId: string;
  designationId: string;
  managerId?: string;
  employmentType: Employee['employmentType'];
  status?: Employee['status'];
  userId?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  departmentId?: string;
  designationId?: string;
  managerId?: string | null;
  employmentType?: Employee['employmentType'];
  status?: Employee['status'];
  userId?: string | null;
}

export type EmployeeResponse = Employee;
export type ListEmployeesResponse = PaginatedResponse<EmployeeResponse>;

// ─── Attendance Types ─────────────────────────────────────────────────────────

export interface CreateAttendanceRequest {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceRecord['status'];
  hoursWorked?: string;
  overtimeHours?: string;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  clockIn?: string;
  clockOut?: string;
  status?: AttendanceRecord['status'];
  hoursWorked?: string;
  overtimeHours?: string;
  notes?: string;
}

export type AttendanceResponse = AttendanceRecord;
export type ListAttendanceResponse = PaginatedResponse<AttendanceResponse>;

// ─── Leave Type Types ─────────────────────────────────────────────────────────

export interface CreateLeaveTypeRequest {
  name: string;
  code: string;
  daysPerYear?: number;
  isPaid?: boolean;
  carryForward?: boolean;
  isActive?: boolean;
}

export interface UpdateLeaveTypeRequest {
  name?: string;
  description?: string;
  daysPerYear?: number;
  isPaid?: boolean;
  carryForward?: boolean;
  isActive?: boolean;
}

export type LeaveTypeResponse = LeaveType;
export type ListLeaveTypesResponse = PaginatedResponse<LeaveTypeResponse>;

// ─── Leave Request Types ──────────────────────────────────────────────────────

export interface CreateLeaveRequestRequest {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
}

export interface ApproveRejectLeaveRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export type LeaveRequestResponse = LeaveRequest;
export type ListLeaveRequestsResponse = PaginatedResponse<LeaveRequestResponse>;

// ─── Salary Types ─────────────────────────────────────────────────────────────

export interface CreateSalaryRequest {
  employeeId: string;
  basicSalary: string;
  currency?: string;
  payFrequency?: Salary['payFrequency'];
  effectiveDate: string;
  isActive?: boolean;
}

export interface UpdateSalaryRequest {
  basicSalary?: string;
  currency?: string;
  payFrequency?: Salary['payFrequency'];
  effectiveDate?: string;
  isActive?: boolean;
}

export type SalaryResponse = Salary;
export type ListSalariesResponse = PaginatedResponse<SalaryResponse>;

// ─── Payroll Types ────────────────────────────────────────────────────────────

export interface CreatePayrollRequest {
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: string;
  allowances?: string;
  deductions?: string;
}

export interface UpdatePayrollRequest {
  basicSalary?: string;
  allowances?: string;
  deductions?: string;
  status?: PayrollRecord['status'];
}

export type PayrollResponse = PayrollRecord;
export type ListPayrollResponse = PaginatedResponse<PayrollResponse>;

// ─── Payslip Types ────────────────────────────────────────────────────────────

export type PayslipResponse = Payslip;
export type ListPayslipsResponse = PaginatedResponse<PayslipResponse>;
