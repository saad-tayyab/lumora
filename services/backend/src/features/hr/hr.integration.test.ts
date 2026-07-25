import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID, cleanupTestData } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string; status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message); this.code = code; this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class { connectionString = ''; constructor(_n: string, _c?: unknown) {} },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as schema from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import * as service from './service';
import {
  DepartmentNotFoundError,
  DuplicateDepartmentCodeError,
  DesignationNotFoundError,
  EmployeeNotFoundError,
  DuplicateEmployeeEmailError,
  DuplicateAttendanceRecordError,
  LeaveTypeNotFoundError,
  LeaveRequestRequiresManagerError,
  NotAuthorizedForLeaveApprovalError,
  LeaveRequestAlreadyProcessedError,
  InvalidLeaveDateRangeError,
  InvalidLeaveDaysError,
  EmployeeNotActiveError,
} from './errors';

const { departments, designations, employees, attendance, leaveTypes, leaveRequests } = schema;

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

function ts(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function cleanupHrTestData(): Promise<void> {
  const cond = (t: { tenantId: string }) => eq(t.tenantId, TEST_TENANT_ID);
  const other = (t: { tenantId: string }) => eq(t.tenantId, OTHER_TENANT_ID);
  for (const c of [cond, other]) {
    await testDb.delete(leaveRequests).where(c(leaveRequests)).catch(() => {});
    await testDb.delete(attendance).where(c(attendance)).catch(() => {});
    await testDb.delete(employees).where(c(employees)).catch(() => {});
    await testDb.delete(leaveTypes).where(c(leaveTypes)).catch(() => {});
    await testDb.delete(designations).where(c(designations)).catch(() => {});
    await testDb.delete(departments).where(c(departments)).catch(() => {});
  }
}

async function createDept(tenantId: string, name?: string) {
  return service.createDepartment(tenantId, {
    name: name ?? `Dept-${ts()}`,
    code: `D-${ts()}`,
  });
}

async function createDesig(tenantId: string, name?: string) {
  return service.createDesignation(tenantId, {
    name: name ?? `Desig-${ts()}`,
    code: `DSG-${ts()}`,
  });
}

async function createEmp(
  tenantId: string,
  deptId: string,
  desigId: string,
  overrides: Record<string, unknown> = {},
) {
  return service.createEmployee(tenantId, {
    firstName: 'Test',
    lastName: 'Employee',
    email: `emp-${ts()}@test.com`,
    hireDate: '2026-01-15',
    departmentId: deptId,
    designationId: desigId,
    employmentType: 'full_time',
    ...overrides,
  });
}

async function createLeaveTypeForTenant(tenantId: string, name?: string) {
  return service.createLeaveType(tenantId, {
    name: name ?? `LT-${ts()}`,
    code: `LT-${ts()}`,
    daysPerYear: 20,
    isPaid: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Employee Lifecycle: dept → designation → create → get → update → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Employee lifecycle', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a department', async () => {
    const dept = await createDept(TEST_TENANT_ID, 'Engineering');
    expect(dept.id).toBeDefined();
    expect(dept.name).toBe('Engineering');
    expect(dept.tenantId).toBe(TEST_TENANT_ID);

    const fetched = await service.getDepartment(dept.id);
    expect(fetched.id).toBe(dept.id);
  });

  it('should create a designation', async () => {
    const desig = await createDesig(TEST_TENANT_ID, 'Software Engineer');
    expect(desig.id).toBeDefined();
    expect(desig.name).toBe('Software Engineer');
    expect(desig.tenantId).toBe(TEST_TENANT_ID);

    const fetched = await service.getDesignation(desig.id);
    expect(fetched.id).toBe(desig.id);
  });

  it('should create an employee and retrieve it', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    expect(emp.id).toBeDefined();
    expect(emp.firstName).toBe('Test');
    expect(emp.lastName).toBe('Employee');
    expect(emp.departmentId).toBe(dept.id);
    expect(emp.designationId).toBe(desig.id);
    expect(emp.tenantId).toBe(TEST_TENANT_ID);

    const fetched = await service.getEmployee(emp.id);
    expect(fetched.id).toBe(emp.id);
    expect(fetched.email).toBe(emp.email);
  });

  it('should update an employee and verify DB state', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    const updated = await service.updateEmployee(emp.id, {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+1-555-9999',
    });
    expect(updated.firstName).toBe('Updated');
    expect(updated.lastName).toBe('Name');
    expect(updated.phone).toBe('+1-555-9999');

    const refetched = await service.getEmployee(emp.id);
    expect(refetched.firstName).toBe('Updated');
    expect(refetched.phone).toBe('+1-555-9999');
  });

  it('should list employees with pagination', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    await createEmp(TEST_TENANT_ID, dept.id, desig.id);
    await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    const result = await service.listEmployees(TEST_TENANT_ID, { page: 1, limit: 50 });
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.page).toBe(1);
  });

  it('should throw DepartmentNotFoundError for non-existent department', async () => {
    await expect(
      service.getDepartment('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(DepartmentNotFoundError);
  });

  it('should reject duplicate department code within tenant', async () => {
    const code = `DUP-${ts()}`;
    await service.createDepartment(TEST_TENANT_ID, { name: 'A', code });
    await expect(
      service.createDepartment(TEST_TENANT_ID, { name: 'B', code }),
    ).rejects.toThrow(DuplicateDepartmentCodeError);
  });

  it('should reject duplicate employee email', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const email = `dup-${ts()}@test.com`;
    await createEmp(TEST_TENANT_ID, dept.id, desig.id, { email });
    await expect(
      createEmp(TEST_TENANT_ID, dept.id, desig.id, { email }),
    ).rejects.toThrow(DuplicateEmployeeEmailError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Attendance Flow: create employee → mark attendance → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Attendance flow', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should mark attendance for an employee', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    const record = await service.createAttendance(TEST_TENANT_ID, {
      employeeId: emp.id,
      date: '2026-07-20',
      clockIn: '09:00',
      clockOut: '17:00',
      status: 'present',
      hoursWorked: '8',
    });

    expect(record.id).toBeDefined();
    expect(record.employeeId).toBe(emp.id);
    expect(record.date).toBe('2026-07-20');
    expect(record.status).toBe('present');
    expect(record.hoursWorked).toBe('8');
    expect(record.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should list attendance records', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    await service.createAttendance(TEST_TENANT_ID, {
      employeeId: emp.id,
      date: '2026-07-21',
      status: 'present',
    });
    await service.createAttendance(TEST_TENANT_ID, {
      employeeId: emp.id,
      date: '2026-07-22',
      status: 'absent',
    });

    const result = await service.listAttendance(TEST_TENANT_ID, { page: 1, limit: 50 });
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it('should reject duplicate attendance on same date', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);

    await service.createAttendance(TEST_TENANT_ID, {
      employeeId: emp.id,
      date: '2026-07-25',
      status: 'present',
    });

    await expect(
      service.createAttendance(TEST_TENANT_ID, {
        employeeId: emp.id,
        date: '2026-07-25',
        status: 'absent',
      }),
    ).rejects.toThrow(DuplicateAttendanceRecordError);
  });

  it('should reject attendance for non-existent employee', async () => {
    await expect(
      service.createAttendance(TEST_TENANT_ID, {
        employeeId: '00000000-0000-0000-0000-000000000000',
        date: '2026-07-20',
        status: 'present',
      }),
    ).rejects.toThrow(EmployeeNotFoundError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Leave Flow: create employee → request leave → approve leave
// ═══════════════════════════════════════════════════════════════════════════════

describe('Leave flow', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a leave request for employee with manager', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      firstName: 'Manager',
      email: `mgr-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      firstName: 'Subordinate',
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID, 'Annual Leave');

    const request = await service.createLeaveRequest(TEST_TENANT_ID, {
      employeeId: emp.id,
      leaveTypeId: leaveType.id,
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      totalDays: 5,
      reason: 'Vacation',
    });

    expect(request.id).toBeDefined();
    expect(request.status).toBe('pending');
    expect(request.employeeId).toBe(emp.id);
    expect(request.totalDays).toBe(5);
    expect(request.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should approve a leave request via manager', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      firstName: 'Approver',
      email: `approver-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      firstName: 'LeaveTaker',
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    const request = await service.createLeaveRequest(TEST_TENANT_ID, {
      employeeId: emp.id,
      leaveTypeId: leaveType.id,
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      totalDays: 3,
    });

    const approved = await service.approveRejectLeaveRequest(request.id, manager.id, {
      status: 'approved',
    });

    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe(manager.id);
    expect(approved.approvedAt).toBeDefined();

    const fetched = await service.getLeaveRequest(request.id);
    expect(fetched.status).toBe('approved');
  });

  it('should reject a leave request via manager with reason', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `rej-mgr-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `rej-emp-${ts()}@test.com`,
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    const request = await service.createLeaveRequest(TEST_TENANT_ID, {
      employeeId: emp.id,
      leaveTypeId: leaveType.id,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      totalDays: 2,
    });

    const rejected = await service.approveRejectLeaveRequest(request.id, manager.id, {
      status: 'rejected',
      rejectionReason: 'Busy period',
    });

    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('Busy period');
  });

  it('should reject leave request without a manager', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id);
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    await expect(
      service.createLeaveRequest(TEST_TENANT_ID, {
        employeeId: emp.id,
        leaveTypeId: leaveType.id,
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        totalDays: 3,
      }),
    ).rejects.toThrow(LeaveRequestRequiresManagerError);
  });

  it('should reject approval from non-manager user', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `auth-mgr-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `auth-emp-${ts()}@test.com`,
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    const request = await service.createLeaveRequest(TEST_TENANT_ID, {
      employeeId: emp.id,
      leaveTypeId: leaveType.id,
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      totalDays: 3,
    });

    const unauthorizedUser = '44444444-4444-4444-8444-444444444444';
    await expect(
      service.approveRejectLeaveRequest(request.id, unauthorizedUser, { status: 'approved' }),
    ).rejects.toThrow(NotAuthorizedForLeaveApprovalError);
  });

  it('should reject re-approval of already processed leave request', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `done-mgr-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `done-emp-${ts()}@test.com`,
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    const request = await service.createLeaveRequest(TEST_TENANT_ID, {
      employeeId: emp.id,
      leaveTypeId: leaveType.id,
      startDate: '2026-08-15',
      endDate: '2026-08-16',
      totalDays: 2,
    });

    await service.approveRejectLeaveRequest(request.id, manager.id, { status: 'approved' });

    await expect(
      service.approveRejectLeaveRequest(request.id, manager.id, { status: 'rejected' }),
    ).rejects.toThrow(LeaveRequestAlreadyProcessedError);
  });

  it('should reject leave with end date before start date', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `mgr-bad-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `emp-bad-${ts()}@test.com`,
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    await expect(
      service.createLeaveRequest(TEST_TENANT_ID, {
        employeeId: emp.id,
        leaveTypeId: leaveType.id,
        startDate: '2026-09-10',
        endDate: '2026-09-05',
        totalDays: 1,
      }),
    ).rejects.toThrow(InvalidLeaveDateRangeError);
  });

  it('should reject leave with zero or negative days', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `mgr-days-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `emp-days-${ts()}@test.com`,
      managerId: manager.id,
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    await expect(
      service.createLeaveRequest(TEST_TENANT_ID, {
        employeeId: emp.id,
        leaveTypeId: leaveType.id,
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        totalDays: 0,
      }),
    ).rejects.toThrow(InvalidLeaveDaysError);
  });

  it('should reject leave for inactive employee', async () => {
    const dept = await createDept(TEST_TENANT_ID);
    const desig = await createDesig(TEST_TENANT_ID);

    const manager = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `mgr-inact-${ts()}@test.com`,
    });
    const emp = await createEmp(TEST_TENANT_ID, dept.id, desig.id, {
      email: `emp-inact-${ts()}@test.com`,
      managerId: manager.id,
      status: 'inactive',
    });
    const leaveType = await createLeaveTypeForTenant(TEST_TENANT_ID);

    await expect(
      service.createLeaveRequest(TEST_TENANT_ID, {
        employeeId: emp.id,
        leaveTypeId: leaveType.id,
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        totalDays: 5,
      }),
    ).rejects.toThrow(EmployeeNotActiveError);
  });
});
