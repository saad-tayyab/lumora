import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID } from '../../lib/integration-test-utils';
import * as schema from '@lumora/database/schema';
import * as repos from './repo';
import { eq } from 'drizzle-orm';

vi.mock('../../database', () => ({ db: testDb }));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));
vi.mock('encore.dev/api', () => ({
  APIError: class extends Error {
    constructor(c: string, m: string) {
      super(m);
    }
  },
  api: vi.fn(),
}));

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';

async function cleanupHrTestData(): Promise<void> {
  const c = (t: { tenantId: string }) => eq(t.tenantId, TEST_TENANT_ID);
  const co = (t: { tenantId: string }) => eq(t.tenantId, OTHER_TENANT);

  for (const cond of [c, co]) {
    await testDb.delete(schema.payslips).where(cond(schema.payslips)).catch(() => {});
    await testDb.delete(schema.payroll).where(cond(schema.payroll)).catch(() => {});
    await testDb.delete(schema.salaries).where(cond(schema.salaries)).catch(() => {});
    await testDb.delete(schema.leaveRequests).where(cond(schema.leaveRequests)).catch(() => {});
    await testDb.delete(schema.attendance).where(cond(schema.attendance)).catch(() => {});
    await testDb.delete(schema.employees).where(cond(schema.employees)).catch(() => {});
    await testDb.delete(schema.leaveTypes).where(cond(schema.leaveTypes)).catch(() => {});
    await testDb.delete(schema.designations).where(cond(schema.designations)).catch(() => {});
    await testDb.delete(schema.departments).where(cond(schema.departments)).catch(() => {});
  }
}

function makeDepartmentInput(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    name: 'Engineering',
    code: `DEPT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'active' as const,
    ...overrides,
  };
}

function makeDesignationInput(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    name: 'Software Engineer',
    code: `DES-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    level: 3,
    isActive: true,
    ...overrides,
  };
}

function makeEmployeeInput(
  departmentId: string,
  designationId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    firstName: 'John',
    lastName: 'Doe',
    email: `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`,
    hireDate: '2026-01-15',
    departmentId,
    designationId,
    employmentType: 'full_time' as const,
    status: 'active' as const,
    ...overrides,
  };
}

function makeAttendanceInput(employeeId: string, overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    employeeId,
    date: '2026-07-15',
    status: 'present' as const,
    hoursWorked: '8.00',
    ...overrides,
  };
}

function makeLeaveTypeInput(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    name: 'Annual Leave',
    code: `LT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    daysPerYear: 20,
    isPaid: true,
    carryForward: false,
    isActive: true,
    ...overrides,
  };
}

function makeLeaveRequestInput(
  employeeId: string,
  leaveTypeId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    employeeId,
    leaveTypeId,
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    totalDays: 5,
    status: 'pending' as const,
    ...overrides,
  };
}

function makeSalaryInput(employeeId: string, overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    employeeId,
    basicSalary: '75000.0000',
    currency: 'USD',
    payFrequency: 'monthly' as const,
    effectiveDate: '2026-01-15',
    isActive: true,
    ...overrides,
  };
}

function makePayrollInput(employeeId: string, overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    employeeId,
    payPeriodStart: '2026-07-01',
    payPeriodEnd: '2026-07-31',
    basicSalary: '6250.0000',
    allowances: '500.0000',
    deductions: '300.0000',
    netPay: '6450.0000',
    status: 'draft' as const,
    ...overrides,
  };
}

function makePayslipInput(
  employeeId: string,
  period: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    employeeId,
    period,
    grossPay: '7000.0000',
    deductions: '300.0000',
    netPay: '6700.0000',
    ...overrides,
  };
}

let deptId: string;
let desId: string;
let empId: string;
let managerId: string;
let leaveTypeId: string;

// ═══════════════════════════════════════════════════════════════════════════════
// Departments Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('departmentRepo', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a department and return it', async () => {
    const input = makeDepartmentInput();
    const [created] = await repos.departmentRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Engineering');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.status).toBe('active');
    deptId = created.id;
  });

  it('should find a department by id', async () => {
    const found = await repos.departmentRepo.findById(deptId);

    expect(found).toBeDefined();
    expect(found!.id).toBe(deptId);
    expect(found!.name).toBe('Engineering');
  });

  it('should return undefined for non-existent department id', async () => {
    const found = await repos.departmentRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find department by code and tenant', async () => {
    const found = await repos.departmentRepo.findByCode(TEST_TENANT_ID, deptId);

    // findByCode uses the code field, not id
    const input = makeDepartmentInput({ name: 'FindByCode' });
    const [created] = await repos.departmentRepo.create(input);
    const foundByCode = await repos.departmentRepo.findByCode(TEST_TENANT_ID, created.code);

    expect(foundByCode).toBeDefined();
    expect(foundByCode!.code).toBe(created.code);
  });

  it('should find children by parent id', async () => {
    const parentInput = makeDepartmentInput({ name: 'ParentDept' });
    const [parent] = await repos.departmentRepo.create(parentInput);

    const childInput = makeDepartmentInput({ name: 'ChildDept', parentId: parent.id });
    await repos.departmentRepo.create(childInput);

    const children = await repos.departmentRepo.findByParentId(parent.id);
    expect(children.length).toBeGreaterThanOrEqual(1);
    children.forEach((c) => {
      expect(c.parentId).toBe(parent.id);
    });
  });

  it('should count employees in a department', async () => {
    const count = await repos.departmentRepo.countEmployeesByDepartment(deptId);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should list departments with pagination', async () => {
    const page = await repos.departmentRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(typeof page.total).toBe('number');
  });

  it('should update a department', async () => {
    const updated = await repos.departmentRepo.update(deptId, { name: 'Updated Engineering' });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Engineering');
  });

  it('should soft delete a department', async () => {
    const input = makeDepartmentInput({ name: 'DeleteMe' });
    const [created] = await repos.departmentRepo.create(input);

    const deleted = await repos.departmentRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Designations Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('designationRepo', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a designation and return it', async () => {
    const input = makeDesignationInput();
    const [created] = await repos.designationRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Software Engineer');
    expect(created.level).toBe(3);
    expect(created.isActive).toBe(true);
    desId = created.id;
  });

  it('should find a designation by id', async () => {
    const found = await repos.designationRepo.findById(desId);

    expect(found).toBeDefined();
    expect(found!.id).toBe(desId);
    expect(found!.name).toBe('Software Engineer');
  });

  it('should return undefined for non-existent designation id', async () => {
    const found = await repos.designationRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find designation by code and tenant', async () => {
    const input = makeDesignationInput({ name: 'CodeLookup' });
    const [created] = await repos.designationRepo.create(input);

    const found = await repos.designationRepo.findByCode(TEST_TENANT_ID, created.code);
    expect(found).toBeDefined();
    expect(found!.code).toBe(created.code);
  });

  it('should find active designations by tenant', async () => {
    await repos.designationRepo.create(
      makeDesignationInput({ name: 'ActiveDes', isActive: true }),
    );
    await repos.designationRepo.create(
      makeDesignationInput({ name: 'InactiveDes', isActive: false }),
    );

    const active = await repos.designationRepo.findActiveByTenant(TEST_TENANT_ID);
    expect(active.length).toBeGreaterThanOrEqual(1);
    active.forEach((d) => {
      expect(d.isActive).toBe(true);
    });
  });

  it('should count employees by designation', async () => {
    const count = await repos.designationRepo.countEmployeesByDesignation(desId);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should list designations with pagination', async () => {
    const page = await repos.designationRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(typeof page.total).toBe('number');
  });

  it('should update a designation', async () => {
    const updated = await repos.designationRepo.update(desId, { name: 'Senior Engineer' });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Senior Engineer');
  });

  it('should soft delete a designation', async () => {
    const input = makeDesignationInput({ name: 'DeleteDes' });
    const [created] = await repos.designationRepo.create(input);

    const deleted = await repos.designationRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Employees Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('employeeRepo', () => {
  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'EmpDept' }));
    deptId = dept.id;
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'EmpDes' }));
    desId = des.id;

    const [mgr] = await repos.employeeRepo.create(
      makeEmployeeInput(deptId, desId, {
        firstName: 'Manager',
        lastName: 'Person',
      }),
    );
    managerId = mgr.id;

    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(deptId, desId, {
        firstName: 'John',
        lastName: 'Doe',
        managerId,
      }),
    );
    empId = emp.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create an employee and return it', async () => {
    const input = makeEmployeeInput(deptId, desId, {
      firstName: 'New',
      lastName: 'Hire',
    });
    const [created] = await repos.employeeRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.firstName).toBe('New');
    expect(created.lastName).toBe('Hire');
    expect(created.departmentId).toBe(deptId);
    expect(created.designationId).toBe(desId);
    expect(created.status).toBe('active');
  });

  it('should find an employee by id', async () => {
    const found = await repos.employeeRepo.findById(empId);

    expect(found).toBeDefined();
    expect(found!.id).toBe(empId);
    expect(found!.firstName).toBe('John');
    expect(found!.lastName).toBe('Doe');
  });

  it('should return undefined for non-existent employee id', async () => {
    const found = await repos.employeeRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find employee by email', async () => {
    const input = makeEmployeeInput(deptId, desId, {
      firstName: 'EmailTest',
      email: `emailfind-${Date.now()}@test.com`,
    });
    const [created] = await repos.employeeRepo.create(input);

    const found = await repos.employeeRepo.findByEmail(created.email);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should find employee by user id', async () => {
    const userId = `00000000-0000-0000-0001-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeEmployeeInput(deptId, desId, {
      firstName: 'UserIdTest',
      userId,
    });
    const [created] = await repos.employeeRepo.create(input);

    const found = await repos.employeeRepo.findByUserId(userId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should find employees by manager id', async () => {
    const found = await repos.employeeRepo.findByManagerId(managerId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((e) => {
      expect(e.managerId).toBe(managerId);
    });
  });

  it('should find active employees by tenant', async () => {
    const active = await repos.employeeRepo.findActiveByTenant(TEST_TENANT_ID);
    expect(active.length).toBeGreaterThanOrEqual(1);
    active.forEach((e) => {
      expect(e.status).toBe('active');
    });
  });

  it('should list employees with pagination', async () => {
    const page = await repos.employeeRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(3);
  });

  it('should update an employee', async () => {
    const updated = await repos.employeeRepo.update(empId, { firstName: 'Jane' });

    expect(updated).toHaveLength(1);
    expect(updated[0].firstName).toBe('Jane');
  });

  it('should soft delete an employee', async () => {
    const input = makeEmployeeInput(deptId, desId, {
      firstName: 'DeleteEmp',
      email: `del-${Date.now()}@test.com`,
    });
    const [created] = await repos.employeeRepo.create(input);

    const deleted = await repos.employeeRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });

  it('should isolate tenants for findMany', async () => {
    const page = await repos.employeeRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Attendance Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('attendanceRepo', () => {
  let attendanceId: string;

  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'AttDept' }));
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'AttDes' }));
    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(dept.id, des.id, { firstName: 'AttEmp' }),
    );
    empId = emp.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create an attendance record and return it', async () => {
    const input = makeAttendanceInput(empId, { date: '2026-07-10' });
    const [created] = await repos.attendanceRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.employeeId).toBe(empId);
    expect(created.date).toBe('2026-07-10');
    expect(created.status).toBe('present');
    attendanceId = created.id;
  });

  it('should find attendance by id', async () => {
    const found = await repos.attendanceRepo.findById(attendanceId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(attendanceId);
  });

  it('should return undefined for non-existent attendance id', async () => {
    const found = await repos.attendanceRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find attendance by employee and date', async () => {
    const found = await repos.attendanceRepo.findByEmployeeAndDate(empId, '2026-07-10');
    expect(found).toBeDefined();
    expect(found!.employeeId).toBe(empId);
    expect(found!.date).toBe('2026-07-10');
  });

  it('should find all attendance records for an employee', async () => {
    await repos.attendanceRepo.create(
      makeAttendanceInput(empId, { date: '2026-07-11', status: 'half_day' }),
    );

    const records = await repos.attendanceRepo.findByEmployee(empId);
    expect(records.length).toBeGreaterThanOrEqual(2);
    records.forEach((r) => {
      expect(r.employeeId).toBe(empId);
    });
  });

  it('should list attendance with pagination', async () => {
    const page = await repos.attendanceRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(2);
  });

  it('should update an attendance record', async () => {
    const updated = await repos.attendanceRepo.update(attendanceId, {
      status: 'work_from_home',
      hoursWorked: '7.50',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('work_from_home');
  });

  it('should hard delete an attendance record', async () => {
    const input = makeAttendanceInput(empId, { date: '2026-07-12' });
    const [created] = await repos.attendanceRepo.create(input);

    await repos.attendanceRepo.delete(created.id);

    const found = await repos.attendanceRepo.findById(created.id);
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for attendance findMany', async () => {
    const page = await repos.attendanceRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Leave Types Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('leaveTypeRepo', () => {
  beforeAll(async () => {
    await cleanupHrTestData();
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a leave type and return it', async () => {
    const input = makeLeaveTypeInput();
    const [created] = await repos.leaveTypeRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Annual Leave');
    expect(created.daysPerYear).toBe(20);
    expect(created.isPaid).toBe(true);
    leaveTypeId = created.id;
  });

  it('should find a leave type by id', async () => {
    const found = await repos.leaveTypeRepo.findById(leaveTypeId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(leaveTypeId);
    expect(found!.name).toBe('Annual Leave');
  });

  it('should return undefined for non-existent leave type id', async () => {
    const found = await repos.leaveTypeRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find leave type by code and tenant', async () => {
    const input = makeLeaveTypeInput({ name: 'Sick Leave', code: `SL-${Date.now()}` });
    const [created] = await repos.leaveTypeRepo.create(input);

    const found = await repos.leaveTypeRepo.findByCode(TEST_TENANT_ID, created.code);
    expect(found).toBeDefined();
    expect(found!.code).toBe(created.code);
  });

  it('should find active leave types by tenant', async () => {
    await repos.leaveTypeRepo.create(
      makeLeaveTypeInput({ name: 'ActiveLT', isActive: true }),
    );
    await repos.leaveTypeRepo.create(
      makeLeaveTypeInput({ name: 'InactiveLT', isActive: false }),
    );

    const active = await repos.leaveTypeRepo.findActiveByTenant(TEST_TENANT_ID);
    expect(active.length).toBeGreaterThanOrEqual(1);
    active.forEach((lt) => {
      expect(lt.isActive).toBe(true);
    });
  });

  it('should count requests by leave type', async () => {
    const count = await repos.leaveTypeRepo.countRequestsByLeaveType(leaveTypeId);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should list leave types with pagination', async () => {
    const page = await repos.leaveTypeRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(typeof page.total).toBe('number');
  });

  it('should update a leave type', async () => {
    const updated = await repos.leaveTypeRepo.update(leaveTypeId, { name: 'Paid Time Off' });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Paid Time Off');
  });

  it('should soft delete a leave type', async () => {
    const input = makeLeaveTypeInput({ name: 'DeleteLT' });
    const [created] = await repos.leaveTypeRepo.create(input);

    const deleted = await repos.leaveTypeRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Leave Requests Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('leaveRequestRepo', () => {
  let leaveRequestId: string;

  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'LRDept' }));
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'LRDes' }));
    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(dept.id, des.id, { firstName: 'LREmp' }),
    );
    empId = emp.id;

    const [lt] = await repos.leaveTypeRepo.create(makeLeaveTypeInput({ name: 'LRLT' }));
    leaveTypeId = lt.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a leave request and return it', async () => {
    const input = makeLeaveRequestInput(empId, leaveTypeId);
    const [created] = await repos.leaveRequestRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.employeeId).toBe(empId);
    expect(created.leaveTypeId).toBe(leaveTypeId);
    expect(created.startDate).toBe('2026-08-01');
    expect(created.endDate).toBe('2026-08-05');
    expect(created.totalDays).toBe(5);
    expect(created.status).toBe('pending');
    leaveRequestId = created.id;
  });

  it('should find a leave request by id', async () => {
    const found = await repos.leaveRequestRepo.findById(leaveRequestId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(leaveRequestId);
  });

  it('should return undefined for non-existent leave request id', async () => {
    const found = await repos.leaveRequestRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find leave requests by employee', async () => {
    await repos.leaveRequestRepo.create(
      makeLeaveRequestInput(empId, leaveTypeId, {
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        totalDays: 3,
      }),
    );

    const found = await repos.leaveRequestRepo.findByEmployee(empId);
    expect(found.length).toBeGreaterThanOrEqual(2);
    found.forEach((lr) => {
      expect(lr.employeeId).toBe(empId);
    });
  });

  it('should find pending leave requests by tenant', async () => {
    const pending = await repos.leaveRequestRepo.findPendingByTenant(TEST_TENANT_ID);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    pending.forEach((lr) => {
      expect(lr.status).toBe('pending');
    });
  });

  it('should list leave requests with pagination', async () => {
    const page = await repos.leaveRequestRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(2);
  });

  it('should update a leave request', async () => {
    const updated = await repos.leaveRequestRepo.update(leaveRequestId, {
      status: 'approved',
      approvedBy: empId,
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('approved');
  });

  it('should soft delete a leave request', async () => {
    const input = makeLeaveRequestInput(empId, leaveTypeId, {
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      totalDays: 1,
    });
    const [created] = await repos.leaveRequestRepo.create(input);

    const deleted = await repos.leaveRequestRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });

  it('should isolate tenants for leave requests', async () => {
    const page = await repos.leaveRequestRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Salaries Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('salaryRepo', () => {
  let salaryId: string;

  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'SalDept' }));
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'SalDes' }));
    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(dept.id, des.id, { firstName: 'SalEmp' }),
    );
    empId = emp.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a salary record and return it', async () => {
    const input = makeSalaryInput(empId);
    const [created] = await repos.salaryRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.employeeId).toBe(empId);
    expect(created.basicSalary).toBe('75000.0000');
    expect(created.currency).toBe('USD');
    expect(created.isActive).toBe(true);
    salaryId = created.id;
  });

  it('should find a salary by id', async () => {
    const found = await repos.salaryRepo.findById(salaryId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(salaryId);
  });

  it('should return undefined for non-existent salary id', async () => {
    const found = await repos.salaryRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find active salary by employee', async () => {
    const found = await repos.salaryRepo.findByEmployee(empId);
    expect(found).toBeDefined();
    expect(found!.employeeId).toBe(empId);
    expect(found!.isActive).toBe(true);
  });

  it('should list salaries with pagination', async () => {
    const page = await repos.salaryRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(1);
  });

  it('should update a salary', async () => {
    const updated = await repos.salaryRepo.update(salaryId, { basicSalary: '80000.0000' });

    expect(updated).toHaveLength(1);
    expect(updated[0].basicSalary).toBe('80000.0000');
  });

  it('should soft delete a salary', async () => {
    const input = makeSalaryInput(empId, {
      basicSalary: '60000.0000',
      effectiveDate: '2025-06-01',
    });
    const [created] = await repos.salaryRepo.create(input);

    const deleted = await repos.salaryRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });

  it('should isolate tenants for salaries', async () => {
    const page = await repos.salaryRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Payroll Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('payrollRepo', () => {
  let payrollId: string;

  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'PayDept' }));
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'PayDes' }));
    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(dept.id, des.id, { firstName: 'PayEmp' }),
    );
    empId = emp.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should create a payroll record and return it', async () => {
    const input = makePayrollInput(empId);
    const [created] = await repos.payrollRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.employeeId).toBe(empId);
    expect(created.payPeriodStart).toBe('2026-07-01');
    expect(created.payPeriodEnd).toBe('2026-07-31');
    expect(created.status).toBe('draft');
    expect(created.basicSalary).toBe('6250.0000');
    expect(created.netPay).toBe('6450.0000');
    payrollId = created.id;
  });

  it('should find a payroll record by id', async () => {
    const found = await repos.payrollRepo.findById(payrollId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(payrollId);
  });

  it('should return undefined for non-existent payroll id', async () => {
    const found = await repos.payrollRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find payroll by employee and period', async () => {
    const found = await repos.payrollRepo.findByEmployeeAndPeriod(
      empId,
      '2026-07-01',
      '2026-07-31',
    );
    expect(found).toBeDefined();
    expect(found!.employeeId).toBe(empId);
    expect(found!.payPeriodStart).toBe('2026-07-01');
  });

  it('should list payroll records with pagination', async () => {
    const page = await repos.payrollRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(1);
  });

  it('should update a payroll record', async () => {
    const updated = await repos.payrollRepo.update(payrollId, {
      status: 'processed',
      processedAt: new Date(),
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('processed');
    expect(updated[0].processedAt).not.toBeNull();
  });

  it('should soft delete a payroll record', async () => {
    const input = makePayrollInput(empId, {
      payPeriodStart: '2026-06-01',
      payPeriodEnd: '2026-06-30',
    });
    const [created] = await repos.payrollRepo.create(input);

    const deleted = await repos.payrollRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).not.toBeNull();
  });

  it('should isolate tenants for payroll', async () => {
    const page = await repos.payrollRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Payslips Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('payslipRepo', () => {
  let payslipId: string;
  let payrollRecordId: string;

  beforeAll(async () => {
    await cleanupHrTestData();

    const [dept] = await repos.departmentRepo.create(makeDepartmentInput({ name: 'PSDept' }));
    const [des] = await repos.designationRepo.create(makeDesignationInput({ name: 'PSDes' }));
    const [emp] = await repos.employeeRepo.create(
      makeEmployeeInput(dept.id, des.id, { firstName: 'PSEmp' }),
    );
    empId = emp.id;

    const [pay] = await repos.payrollRepo.create(
      makePayrollInput(empId, {
        payPeriodStart: '2026-07-01',
        payPeriodEnd: '2026-07-31',
      }),
    );
    payrollRecordId = pay.id;
  });

  afterAll(async () => {
    await cleanupHrTestData();
  });

  it('should find a payslip by id', async () => {
    const input = makePayslipInput(empId, '2026-07', { payrollId: payrollRecordId });
    const [created] = await testDb
      .insert(schema.payslips)
      .values({ ...input, tenantId: TEST_TENANT_ID })
      .returning();

    payslipId = created.id;

    const found = await repos.payslipRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.period).toBe('2026-07');
    expect(found!.grossPay).toBe('7000.0000');
    expect(found!.netPay).toBe('6700.0000');
  });

  it('should return undefined for non-existent payslip id', async () => {
    const found = await repos.payslipRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find payslips by employee', async () => {
    const found = await repos.payslipRepo.findByEmployee(empId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((p) => {
      expect(p.employeeId).toBe(empId);
    });
  });

  it('should find payslips by payroll id', async () => {
    const found = await repos.payslipRepo.findByPayroll(payrollRecordId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((p) => {
      expect(p.payrollId).toBe(payrollRecordId);
    });
  });

  it('should list payslips with pagination', async () => {
    const page = await repos.payslipRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2, offset: 0 });

    expect(page.data).toBeDefined();
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(1);
  });

  it('should isolate tenants for payslips', async () => {
    const page = await repos.payslipRepo.findMany({ tenantId: OTHER_TENANT, limit: 50, offset: 0 });
    expect(page.data).toHaveLength(0);
    expect(page.total).toBe(0);
  });
});
