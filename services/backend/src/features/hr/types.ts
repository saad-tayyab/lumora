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
  status?: 'active' | 'inactive';
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  headId?: string | null;
  parentId?: string | null;
  status?: 'active' | 'inactive';
}

export interface DepartmentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  description: string | null;
  headId: string | null;
  parentId: string | null;
  status: 'active' | 'inactive';
}

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

export interface DesignationResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  description: string | null;
  level: number;
  salaryBandMin: string | null;
  salaryBandMax: string | null;
  isActive: boolean;
}

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
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status?: 'active' | 'on_leave' | 'terminated';
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
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern';
  status?: 'active' | 'on_leave' | 'terminated';
  userId?: string | null;
}

export interface EmployeeResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  hireDate: string;
  departmentId: string;
  designationId: string;
  managerId: string | null;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'on_leave' | 'terminated';
}

export type ListEmployeesResponse = PaginatedResponse<EmployeeResponse>;

// ─── Attendance Types ─────────────────────────────────────────────────────────

export interface CreateAttendanceRequest {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'half_day' | 'work_from_home';
  hoursWorked?: string;
  overtimeHours?: string;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  clockIn?: string;
  clockOut?: string;
  status?: 'present' | 'absent' | 'half_day' | 'work_from_home';
  hoursWorked?: string;
  overtimeHours?: string;
  notes?: string;
}

export interface AttendanceResponse {
  id: string;
  tenantId: string;
  employeeId: string;
  date: string;
  clockIn: Date | null;
  clockOut: Date | null;
  status: 'present' | 'absent' | 'half_day' | 'work_from_home';
  hoursWorked: string | null;
  overtimeHours: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface LeaveTypeResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  daysPerYear: number;
  isPaid: boolean;
  carryForward: boolean;
  isActive: boolean;
}

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

export interface LeaveRequestResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
}

export type ListLeaveRequestsResponse = PaginatedResponse<LeaveRequestResponse>;

// ─── Salary Types ─────────────────────────────────────────────────────────────

export interface CreateSalaryRequest {
  employeeId: string;
  basicSalary: string;
  currency?: string;
  payFrequency?: 'monthly' | 'bi_weekly' | 'weekly';
  effectiveDate: string;
  isActive?: boolean;
}

export interface UpdateSalaryRequest {
  basicSalary?: string;
  currency?: string;
  payFrequency?: 'monthly' | 'bi_weekly' | 'weekly';
  effectiveDate?: string;
  isActive?: boolean;
}

export interface SalaryResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  employeeId: string;
  basicSalary: string;
  currency: string;
  payFrequency: 'monthly' | 'bi_weekly' | 'weekly';
  effectiveDate: string;
  isActive: boolean;
}

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
  status?: 'draft' | 'processed' | 'paid';
}

export interface PayrollResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  netPay: string;
  status: 'draft' | 'processed' | 'paid';
  processedAt: Date | null;
  paidAt: Date | null;
}

export type ListPayrollResponse = PaginatedResponse<PayrollResponse>;

// ─── Payslip Types ────────────────────────────────────────────────────────────

export interface PayslipResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  employeeId: string;
  payrollId: string | null;
  period: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  generatedAt: Date;
}

export type ListPayslipsResponse = PaginatedResponse<PayslipResponse>;
