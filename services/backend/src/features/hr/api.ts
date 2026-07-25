import { api, getCurrentContext } from 'encore.dev/api';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
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
  PayrollResponse,
  PayslipResponse,
  SalaryResponse,
  UpdateAttendanceRequest,
  UpdateDepartmentRequest,
  UpdateDesignationRequest,
  UpdateEmployeeRequest,
  UpdatePayrollRequest,
  UpdateSalaryRequest,
} from './types';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Department Schemas ──────────────────────────────────────────────────────

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  headId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  headId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ─── Designation Schemas ─────────────────────────────────────────────────────

const createDesignationSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  level: z.number().int().min(1).optional(),
  salaryBandMin: z.string().optional(),
  salaryBandMax: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateDesignationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  level: z.number().int().min(1).optional(),
  salaryBandMin: z.string().nullable().optional(),
  salaryBandMax: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ─── Employee Schemas ────────────────────────────────────────────────────────

const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  managerId: z.string().uuid().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  status: z.enum(['active', 'on_leave', 'terminated']).optional(),
  userId: z.string().uuid().optional(),
});

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  managerId: z.string().uuid().nullable().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']).optional(),
  status: z.enum(['active', 'on_leave', 'terminated']).optional(),
  userId: z.string().uuid().nullable().optional(),
});

// ─── Attendance Schemas ──────────────────────────────────────────────────────

const createAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional(),
  status: z.enum(['present', 'absent', 'half_day', 'work_from_home']),
  hoursWorked: z.string().optional(),
  overtimeHours: z.string().optional(),
  notes: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional(),
  status: z.enum(['present', 'absent', 'half_day', 'work_from_home']).optional(),
  hoursWorked: z.string().optional(),
  overtimeHours: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Leave Type Schemas ──────────────────────────────────────────────────────

const createLeaveTypeSchema = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(20),
  daysPerYear: z.number().int().min(0).optional(),
  isPaid: z.boolean().optional(),
  carryForward: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const updateLeaveTypeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  daysPerYear: z.number().int().min(0).optional(),
  isPaid: z.boolean().optional(),
  carryForward: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ─── Leave Request Schemas ───────────────────────────────────────────────────

const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  totalDays: z.number().int().positive(),
  reason: z.string().optional(),
});

const approveRejectLeaveRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

// ─── Salary Schemas ──────────────────────────────────────────────────────────

const createSalarySchema = z.object({
  employeeId: z.string().uuid(),
  basicSalary: z.string().min(1),
  currency: z.string().length(3).optional(),
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']).optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  isActive: z.boolean().optional(),
});

const updateSalarySchema = z.object({
  basicSalary: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']).optional(),
  effectiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  isActive: z.boolean().optional(),
});

// ─── Payroll Schemas ─────────────────────────────────────────────────────────

const createPayrollSchema = z.object({
  employeeId: z.string().uuid(),
  payPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  payPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  basicSalary: z.string().min(1),
  allowances: z.string().optional(),
  deductions: z.string().optional(),
});

const updatePayrollSchema = z.object({
  basicSalary: z.string().min(1).optional(),
  allowances: z.string().optional(),
  deductions: z.string().optional(),
  status: z.enum(['draft', 'processed', 'paid']).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthContext() {
  const ctx = getCurrentContext();
  return authenticate(ctx.request?.headers);
}

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      details[path] = [issue.message];
    }
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// ─── Departments ─────────────────────────────────────────────────────────────

export const getDepartment = api(
  { expose: true, method: 'GET', path: '/hr/departments/:id' },
  async ({ id }: { id: string }): Promise<DepartmentResponse> => {
    await getAuthContext();
    return service.getDepartment(id);
  },
);

export const listDepartments = api(
  { expose: true, method: 'GET', path: '/hr/departments' },
  async (params: { page?: number; limit?: number }): Promise<ListDepartmentsResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listDepartments(auth.tenantId, query);
  },
);

export const createDepartment = api(
  { expose: true, method: 'POST', path: '/hr/departments' },
  async (req: CreateDepartmentRequest): Promise<DepartmentResponse> => {
    const auth = await getAuthContext();
    const input = validate(createDepartmentSchema, req);
    return service.createDepartment(auth.tenantId, input);
  },
);

export const updateDepartment = api(
  { expose: true, method: 'PATCH', path: '/hr/departments/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateDepartmentRequest): Promise<DepartmentResponse> => {
    await getAuthContext();
    const input = validate(updateDepartmentSchema, body);
    return service.updateDepartment(id, input);
  },
);

export const deleteDepartment = api(
  { expose: true, method: 'DELETE', path: '/hr/departments/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteDepartment(id);
  },
);

// ─── Designations ────────────────────────────────────────────────────────────

export const getDesignation = api(
  { expose: true, method: 'GET', path: '/hr/designations/:id' },
  async ({ id }: { id: string }): Promise<DesignationResponse> => {
    await getAuthContext();
    return service.getDesignation(id);
  },
);

export const listDesignations = api(
  { expose: true, method: 'GET', path: '/hr/designations' },
  async (params: { page?: number; limit?: number }): Promise<ListDesignationsResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listDesignations(auth.tenantId, query);
  },
);

export const createDesignation = api(
  { expose: true, method: 'POST', path: '/hr/designations' },
  async (req: CreateDesignationRequest): Promise<DesignationResponse> => {
    const auth = await getAuthContext();
    const input = validate(createDesignationSchema, req);
    return service.createDesignation(auth.tenantId, input);
  },
);

export const updateDesignation = api(
  { expose: true, method: 'PATCH', path: '/hr/designations/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateDesignationRequest): Promise<DesignationResponse> => {
    await getAuthContext();
    const input = validate(updateDesignationSchema, body);
    return service.updateDesignation(id, input);
  },
);

export const deleteDesignation = api(
  { expose: true, method: 'DELETE', path: '/hr/designations/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteDesignation(id);
  },
);

// ─── Employees ───────────────────────────────────────────────────────────────

export const getEmployee = api(
  { expose: true, method: 'GET', path: '/hr/employees/:id' },
  async ({ id }: { id: string }): Promise<EmployeeResponse> => {
    await getAuthContext();
    return service.getEmployee(id);
  },
);

export const listEmployees = api(
  { expose: true, method: 'GET', path: '/hr/employees' },
  async (params: { page?: number; limit?: number }): Promise<ListEmployeesResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listEmployees(auth.tenantId, query);
  },
);

export const createEmployee = api(
  { expose: true, method: 'POST', path: '/hr/employees' },
  async (req: CreateEmployeeRequest): Promise<EmployeeResponse> => {
    const auth = await getAuthContext();
    const input = validate(createEmployeeSchema, req);
    return service.createEmployee(auth.tenantId, input);
  },
);

export const updateEmployee = api(
  { expose: true, method: 'PATCH', path: '/hr/employees/:id' },
  async ({ id, ...body }: { id: string } & UpdateEmployeeRequest): Promise<EmployeeResponse> => {
    await getAuthContext();
    const input = validate(updateEmployeeSchema, body);
    return service.updateEmployee(id, input);
  },
);

export const deleteEmployee = api(
  { expose: true, method: 'DELETE', path: '/hr/employees/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteEmployee(id);
  },
);

// ─── Attendance ──────────────────────────────────────────────────────────────

export const getAttendance = api(
  { expose: true, method: 'GET', path: '/hr/attendance/:id' },
  async ({ id }: { id: string }): Promise<AttendanceResponse> => {
    await getAuthContext();
    return service.getAttendance(id);
  },
);

export const listAttendance = api(
  { expose: true, method: 'GET', path: '/hr/attendance' },
  async (params: { page?: number; limit?: number }): Promise<ListAttendanceResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listAttendance(auth.tenantId, query);
  },
);

export const createAttendance = api(
  { expose: true, method: 'POST', path: '/hr/attendance' },
  async (req: CreateAttendanceRequest): Promise<AttendanceResponse> => {
    const auth = await getAuthContext();
    const input = validate(createAttendanceSchema, req);
    return service.createAttendance(auth.tenantId, input);
  },
);

export const updateAttendance = api(
  { expose: true, method: 'PATCH', path: '/hr/attendance/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateAttendanceRequest): Promise<AttendanceResponse> => {
    await getAuthContext();
    const input = validate(updateAttendanceSchema, body);
    return service.updateAttendance(id, input);
  },
);

export const deleteAttendance = api(
  { expose: true, method: 'DELETE', path: '/hr/attendance/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteAttendance(id);
  },
);

// ─── Leave Types ─────────────────────────────────────────────────────────────

export const getLeaveType = api(
  { expose: true, method: 'GET', path: '/hr/leave-types/:id' },
  async ({ id }: { id: string }): Promise<LeaveTypeResponse> => {
    await getAuthContext();
    return service.getLeaveType(id);
  },
);

export const listLeaveTypes = api(
  { expose: true, method: 'GET', path: '/hr/leave-types' },
  async (params: { page?: number; limit?: number }): Promise<ListLeaveTypesResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listLeaveTypes(auth.tenantId, query);
  },
);

export const createLeaveType = api(
  { expose: true, method: 'POST', path: '/hr/leave-types' },
  async (req: CreateLeaveTypeRequest): Promise<LeaveTypeResponse> => {
    const auth = await getAuthContext();
    const input = validate(createLeaveTypeSchema, req);
    return service.createLeaveType(auth.tenantId, input);
  },
);

export const updateLeaveType = api(
  { expose: true, method: 'PATCH', path: '/hr/leave-types/:id' },
  async ({ id, ...body }: { id: string } & UpdateLeaveTypeRequest): Promise<LeaveTypeResponse> => {
    await getAuthContext();
    const input = validate(updateLeaveTypeSchema, body);
    return service.updateLeaveType(id, input);
  },
);

export const deleteLeaveType = api(
  { expose: true, method: 'DELETE', path: '/hr/leave-types/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteLeaveType(id);
  },
);

// ─── Leave Requests ──────────────────────────────────────────────────────────

export const getLeaveRequest = api(
  { expose: true, method: 'GET', path: '/hr/leave-requests/:id' },
  async ({ id }: { id: string }): Promise<LeaveRequestResponse> => {
    await getAuthContext();
    return service.getLeaveRequest(id);
  },
);

export const listLeaveRequests = api(
  { expose: true, method: 'GET', path: '/hr/leave-requests' },
  async (params: { page?: number; limit?: number }): Promise<ListLeaveRequestsResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listLeaveRequests(auth.tenantId, query);
  },
);

export const createLeaveRequest = api(
  { expose: true, method: 'POST', path: '/hr/leave-requests' },
  async (req: CreateLeaveRequestRequest): Promise<LeaveRequestResponse> => {
    const auth = await getAuthContext();
    const input = validate(createLeaveRequestSchema, req);
    return service.createLeaveRequest(auth.tenantId, input);
  },
);

export const approveRejectLeaveRequest = api(
  { expose: true, method: 'PATCH', path: '/hr/leave-requests/:id/approve' },
  async ({
    id,
    ...body
  }: { id: string } & ApproveRejectLeaveRequest): Promise<LeaveRequestResponse> => {
    const auth = await getAuthContext();
    const input = validate(approveRejectLeaveRequestSchema, body);
    return service.approveRejectLeaveRequest(id, auth.userId, input);
  },
);

// ─── Salaries ────────────────────────────────────────────────────────────────

export const getSalary = api(
  { expose: true, method: 'GET', path: '/hr/salaries/:id' },
  async ({ id }: { id: string }): Promise<SalaryResponse> => {
    await getAuthContext();
    return service.getSalary(id);
  },
);

export const listSalaries = api(
  { expose: true, method: 'GET', path: '/hr/salaries' },
  async (params: { page?: number; limit?: number }): Promise<ListSalariesResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listSalaries(auth.tenantId, query);
  },
);

export const createSalary = api(
  { expose: true, method: 'POST', path: '/hr/salaries' },
  async (req: CreateSalaryRequest): Promise<SalaryResponse> => {
    const auth = await getAuthContext();
    const input = validate(createSalarySchema, req);
    return service.createSalary(auth.tenantId, input);
  },
);

export const updateSalary = api(
  { expose: true, method: 'PATCH', path: '/hr/salaries/:id' },
  async ({ id, ...body }: { id: string } & UpdateSalaryRequest): Promise<SalaryResponse> => {
    await getAuthContext();
    const input = validate(updateSalarySchema, body);
    return service.updateSalary(id, input);
  },
);

export const deleteSalary = api(
  { expose: true, method: 'DELETE', path: '/hr/salaries/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deleteSalary(id);
  },
);

// ─── Payroll ─────────────────────────────────────────────────────────────────

export const getPayroll = api(
  { expose: true, method: 'GET', path: '/hr/payroll/:id' },
  async ({ id }: { id: string }): Promise<PayrollResponse> => {
    await getAuthContext();
    return service.getPayroll(id);
  },
);

export const listPayroll = api(
  { expose: true, method: 'GET', path: '/hr/payroll' },
  async (params: { page?: number; limit?: number }): Promise<ListPayrollResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listPayroll(auth.tenantId, query);
  },
);

export const createPayroll = api(
  { expose: true, method: 'POST', path: '/hr/payroll' },
  async (req: CreatePayrollRequest): Promise<PayrollResponse> => {
    const auth = await getAuthContext();
    const input = validate(createPayrollSchema, req);
    return service.createPayroll(auth.tenantId, input);
  },
);

export const updatePayroll = api(
  { expose: true, method: 'PATCH', path: '/hr/payroll/:id' },
  async ({ id, ...body }: { id: string } & UpdatePayrollRequest): Promise<PayrollResponse> => {
    await getAuthContext();
    const input = validate(updatePayrollSchema, body);
    return service.updatePayroll(id, input);
  },
);

export const processPayroll = api(
  { expose: true, method: 'POST', path: '/hr/payroll/:id/process' },
  async ({ id }: { id: string }): Promise<PayrollResponse> => {
    await getAuthContext();
    return service.processPayroll(id);
  },
);

export const deletePayroll = api(
  { expose: true, method: 'DELETE', path: '/hr/payroll/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    await getAuthContext();
    return service.deletePayroll(id);
  },
);

// ─── Payslips ────────────────────────────────────────────────────────────────

export const getPayslip = api(
  { expose: true, method: 'GET', path: '/hr/payslips/:id' },
  async ({ id }: { id: string }): Promise<PayslipResponse> => {
    await getAuthContext();
    return service.getPayslip(id);
  },
);

export const listPayslips = api(
  { expose: true, method: 'GET', path: '/hr/payslips' },
  async (params: { page?: number; limit?: number }): Promise<ListPayslipsResponse> => {
    const auth = await getAuthContext();
    const query = validate(paginationSchema, params);
    return service.listPayslips(auth.tenantId, query);
  },
);
