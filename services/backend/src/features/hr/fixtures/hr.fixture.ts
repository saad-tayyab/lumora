import { TEST_TENANT_ID } from '../../../lib/test-utils';

// ─── Department Fixtures ──────────────────────────────────────────────────

export const createDepartmentFixture = (overrides = {}) => ({
  id: 'dept-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Engineering',
  code: 'ENG',
  description: 'Engineering department',
  headId: null as string | null,
  parentId: null as string | null,
  status: 'active' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createDepartmentInputFixture = (overrides = {}) => ({
  name: 'Engineering',
  code: 'ENG',
  description: 'Engineering department',
  ...overrides,
});

// ─── Designation Fixtures ─────────────────────────────────────────────────

export const createDesignationFixture = (overrides = {}) => ({
  id: 'desig-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Senior Engineer',
  code: 'SR-ENG',
  description: 'Senior Engineering role',
  level: 3,
  salaryBandMin: '80000',
  salaryBandMax: '120000',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createDesignationInputFixture = (overrides = {}) => ({
  name: 'Senior Engineer',
  code: 'SR-ENG',
  description: 'Senior Engineering role',
  ...overrides,
});

// ─── Employee Fixtures ────────────────────────────────────────────────────

export const createEmployeeFixture = (overrides = {}) => ({
  id: 'emp-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0100',
  hireDate: '2026-01-15',
  departmentId: 'dept-00000000-0000-0000-000000000001',
  designationId: 'desig-00000000-0000-0000-000000000001',
  managerId: null as string | null,
  employmentType: 'full_time' as const,
  status: 'active' as const,
  userId: null as string | null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  deletedAt: null,
  ...overrides,
});

export const createEmployeeInputFixture = (overrides = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0100',
  hireDate: '2026-01-15',
  departmentId: 'dept-00000000-0000-0000-000000000001',
  designationId: 'desig-00000000-0000-0000-000000000001',
  employmentType: 'full_time' as const,
  ...overrides,
});

// ─── Attendance Fixtures ──────────────────────────────────────────────────

export const createAttendanceFixture = (overrides = {}) => ({
  id: 'att-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  employeeId: 'emp-00000000-0000-0000-000000000001',
  date: '2026-07-15',
  clockIn: '09:00',
  clockOut: '17:00',
  status: 'present' as const,
  hoursWorked: '8',
  overtimeHours: '0',
  notes: null as string | null,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createAttendanceInputFixture = (overrides = {}) => ({
  employeeId: 'emp-00000000-0000-0000-000000000001',
  date: '2026-07-15',
  clockIn: '09:00',
  clockOut: '17:00',
  status: 'present' as const,
  hoursWorked: '8',
  overtimeHours: '0',
  ...overrides,
});

// ─── Leave Type Fixtures ──────────────────────────────────────────────────

export const createLeaveTypeFixture = (overrides = {}) => ({
  id: 'lt-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Annual Leave',
  code: 'AL',
  description: 'Annual paid leave',
  daysPerYear: 20,
  isPaid: true,
  carryForward: false,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createLeaveTypeInputFixture = (overrides = {}) => ({
  name: 'Annual Leave',
  code: 'AL',
  daysPerYear: 20,
  isPaid: true,
  carryForward: false,
  ...overrides,
});

// ─── Leave Request Fixtures ───────────────────────────────────────────────

export const createLeaveRequestFixture = (overrides = {}) => ({
  id: 'lr-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  employeeId: 'emp-00000000-0000-0000-000000000001',
  leaveTypeId: 'lt-00000000-0000-0000-000000000001',
  startDate: '2026-08-01',
  endDate: '2026-08-05',
  totalDays: 5,
  reason: 'Vacation',
  status: 'pending' as const,
  approvedBy: null as string | null,
  approvedAt: null as Date | null,
  rejectionReason: null as string | null,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createLeaveRequestInputFixture = (overrides = {}) => ({
  employeeId: 'emp-00000000-0000-0000-000000000001',
  leaveTypeId: 'lt-00000000-0000-0000-000000000001',
  startDate: '2026-08-01',
  endDate: '2026-08-05',
  totalDays: 5,
  reason: 'Vacation',
  ...overrides,
});

// ─── Salary Fixtures ──────────────────────────────────────────────────────

export const createSalaryFixture = (overrides = {}) => ({
  id: 'sal-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  employeeId: 'emp-00000000-0000-0000-000000000001',
  basicSalary: '75000',
  currency: 'USD',
  payFrequency: 'monthly' as const,
  effectiveDate: '2026-01-15',
  isActive: true,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  deletedAt: null,
  ...overrides,
});

export const createSalaryInputFixture = (overrides = {}) => ({
  employeeId: 'emp-00000000-0000-0000-000000000001',
  basicSalary: '75000',
  currency: 'USD',
  payFrequency: 'monthly' as const,
  effectiveDate: '2026-01-15',
  ...overrides,
});

// ─── Payroll Fixtures ─────────────────────────────────────────────────────

export const createPayrollFixture = (overrides = {}) => ({
  id: 'pay-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  employeeId: 'emp-00000000-0000-0000-000000000001',
  payPeriodStart: '2026-07-01',
  payPeriodEnd: '2026-07-31',
  basicSalary: '6250',
  allowances: '500',
  deductions: '750',
  netPay: '6000',
  status: 'draft' as const,
  processedAt: null as Date | null,
  createdAt: new Date('2026-07-31'),
  updatedAt: new Date('2026-07-31'),
  deletedAt: null,
  ...overrides,
});

export const createPayrollInputFixture = (overrides = {}) => ({
  employeeId: 'emp-00000000-0000-0000-000000000001',
  payPeriodStart: '2026-07-01',
  payPeriodEnd: '2026-07-31',
  basicSalary: '6250',
  allowances: '500',
  deductions: '750',
  ...overrides,
});

// ─── Payslip Fixtures ─────────────────────────────────────────────────────

export const createPayslipFixture = (overrides = {}) => ({
  id: 'ps-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  employeeId: 'emp-00000000-0000-0000-000000000001',
  payrollId: 'pay-00000000-0000-0000-000000000001',
  generatedAt: new Date('2026-07-31'),
  ...overrides,
});
