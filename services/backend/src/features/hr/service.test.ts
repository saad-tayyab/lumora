import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createAttendanceFixture,
  createAttendanceInputFixture,
  createDepartmentFixture,
  createDepartmentInputFixture,
  createDesignationFixture,
  createDesignationInputFixture,
  createEmployeeFixture,
  createEmployeeInputFixture,
  createLeaveRequestFixture,
  createLeaveRequestInputFixture,
  createLeaveTypeFixture,
  createLeaveTypeInputFixture,
  createPayrollFixture,
  createPayrollInputFixture,
  createPayslipFixture,
  createSalaryFixture,
  createSalaryInputFixture,
} from './fixtures/hr.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    constructor(_code: string, message: string, _details?: unknown) {
      super(message);
      this.name = 'APIError';
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {},
};

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

// ─── Mock Schema (used directly in service transactions) ──────────────────

const { createMockTable } = vi.hoisted(() => ({
  createMockTable: (name: string) => {
    const table = { _: { name, schema: undefined } } as Record<string, unknown>;
    return new Proxy(table, {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return {
          _: { name: String(prop), schema: undefined },
          toString: () => `${name}.${String(prop)}`,
        };
      },
    });
  },
}));

vi.mock('@lumora/database/schema', () => ({
  departments: createMockTable('departments'),
  designations: createMockTable('designations'),
  employees: createMockTable('employees'),
  attendance: createMockTable('attendance'),
  leaveTypes: createMockTable('leave_types'),
  leaveRequests: createMockTable('leave_requests'),
  salaries: createMockTable('salaries'),
  payroll: createMockTable('payroll'),
  payslips: createMockTable('payslips'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    desc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockDepartmentRepo,
  mockDesignationRepo,
  mockEmployeeRepo,
  mockAttendanceRepo,
  mockLeaveTypeRepo,
  mockLeaveRequestRepo,
  mockSalaryRepo,
  mockPayrollRepo,
  mockPayslipRepo,
} = vi.hoisted(() => ({
  mockDepartmentRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findByParentId: vi.fn(),
    countEmployeesByDepartment: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockDesignationRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    countEmployeesByDesignation: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockEmployeeRepo: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockAttendanceRepo: {
    findById: vi.fn(),
    findByEmployeeAndDate: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockLeaveTypeRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    countRequestsByLeaveType: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockLeaveRequestRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockSalaryRepo: {
    findById: vi.fn(),
    findByEmployee: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockPayrollRepo: {
    findById: vi.fn(),
    findByEmployeeAndPeriod: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockPayslipRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  departmentRepo: mockDepartmentRepo,
  designationRepo: mockDesignationRepo,
  employeeRepo: mockEmployeeRepo,
  attendanceRepo: mockAttendanceRepo,
  leaveTypeRepo: mockLeaveTypeRepo,
  leaveRequestRepo: mockLeaveRequestRepo,
  salaryRepo: mockSalaryRepo,
  payrollRepo: mockPayrollRepo,
  payslipRepo: mockPayslipRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

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
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('HR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPARTMENT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Department Service', () => {
    describe('getDepartment', () => {
      it('should return department by id', async () => {
        const dept = createDepartmentFixture();
        mockDepartmentRepo.findById.mockResolvedValue(dept);

        const result = await service.getDepartment(dept.id);

        expect(result).toEqual(dept);
        expect(mockDepartmentRepo.findById).toHaveBeenCalledWith(dept.id);
      });

      it('should throw DepartmentNotFoundError for non-existent department', async () => {
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDepartment('non-existent')).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });
    });

    describe('listDepartments', () => {
      it('should return paginated departments', async () => {
        const dept = createDepartmentFixture();
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [dept], total: 1 });

        const result = await service.listDepartments(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no departments exist', async () => {
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listDepartments(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.totalPages).toBe(0);
      });

      it('should calculate correct totalPages', async () => {
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 45 });

        const result = await service.listDepartments(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.totalPages).toBe(3);
      });

      it('should calculate correct offset for page 3', async () => {
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDepartments(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockDepartmentRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 20 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDepartments(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockDepartmentRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });

      it('should use default pagination values', async () => {
        mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDepartments(TEST_TENANT_ID, {});

        expect(mockDepartmentRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 20, offset: 0 }),
        );
      });
    });

    describe('createDepartment', () => {
      it('should create department with unique code', async () => {
        const input = createDepartmentInputFixture();
        const expected = createDepartmentFixture();

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockDepartmentRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepartment(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockDepartmentRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockDepartmentRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate department code', async () => {
        const input = createDepartmentInputFixture();
        const existing = createDepartmentFixture();

        mockDepartmentRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createDepartment(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateDepartmentCodeError,
        );
      });

      it('should validate parent department exists if provided', async () => {
        const input = createDepartmentInputFixture({ parentId: 'parent-1' });

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.createDepartment(TEST_TENANT_ID, input)).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });

      it('should create department with valid parent', async () => {
        const parent = createDepartmentFixture({ id: 'parent-1' });
        const input = createDepartmentInputFixture({ parentId: 'parent-1' });
        const expected = createDepartmentFixture({ parentId: 'parent-1' });

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(parent);
        mockDepartmentRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepartment(TEST_TENANT_ID, input);

        expect(result.parentId).toBe('parent-1');
      });

      it('should validate head employee exists if provided', async () => {
        const input = createDepartmentInputFixture({ headId: 'emp-1' });

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createDepartment(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should create department with valid head', async () => {
        const head = createEmployeeFixture({ id: 'emp-1' });
        const input = createDepartmentInputFixture({ headId: 'emp-1' });
        const expected = createDepartmentFixture({ headId: 'emp-1' });

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockEmployeeRepo.findById.mockResolvedValue(head);
        mockDepartmentRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepartment(TEST_TENANT_ID, input);

        expect(result.headId).toBe('emp-1');
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createDepartmentInputFixture({ code: 'ENG' });

        mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
        mockDepartmentRepo.create.mockResolvedValue([createDepartmentFixture()]);

        await service.createDepartment(TEST_TENANT_ID, input);

        expect(mockDepartmentRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'ENG');
      });
    });

    describe('updateDepartment', () => {
      it('should update department name', async () => {
        const existing = createDepartmentFixture();
        const updated = { ...existing, name: 'Updated Engineering' };

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDepartment(existing.id, {
          name: 'Updated Engineering',
        });

        expect(result.name).toBe('Updated Engineering');
        expect(mockDepartmentRepo.update).toHaveBeenCalledWith(existing.id, {
          name: 'Updated Engineering',
        });
      });

      it('should throw DepartmentNotFoundError for non-existent department', async () => {
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateDepartment('non-existent', { name: 'Test' })).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });

      it('should validate parent department if changing', async () => {
        const existing = createDepartmentFixture();
        mockDepartmentRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(undefined);

        await expect(
          service.updateDepartment(existing.id, { parentId: 'non-existent-parent' }),
        ).rejects.toThrow(DepartmentNotFoundError);
      });

      it('should prevent circular parent reference', async () => {
        const existing = createDepartmentFixture({ id: 'dept-1' });
        mockDepartmentRepo.findById.mockResolvedValue(existing);

        await expect(service.updateDepartment('dept-1', { parentId: 'dept-1' })).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });

      it('should allow updating parent to null', async () => {
        const existing = createDepartmentFixture({ parentId: 'parent-1' });
        const updated = { ...existing, parentId: null };

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDepartment(existing.id, { parentId: null });

        expect(result.parentId).toBeNull();
      });

      it('should validate head employee if changing', async () => {
        const existing = createDepartmentFixture();
        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateDepartment(existing.id, { headId: 'non-existent-emp' }),
        ).rejects.toThrow(EmployeeNotFoundError);
      });

      it('should allow updating head to null', async () => {
        const existing = createDepartmentFixture({ headId: 'emp-1' });
        const updated = { ...existing, headId: null };

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDepartment(existing.id, { headId: null });

        expect(result.headId).toBeNull();
      });
    });

    describe('deleteDepartment', () => {
      it('should soft delete department', async () => {
        const existing = createDepartmentFixture();

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.findByParentId.mockResolvedValue([]);
        mockDepartmentRepo.countEmployeesByDepartment.mockResolvedValue(0);
        mockDepartmentRepo.softDelete.mockResolvedValue([]);

        await service.deleteDepartment(existing.id);

        expect(mockDepartmentRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw DepartmentNotFoundError for non-existent department', async () => {
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteDepartment('non-existent')).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });

      it('should reject deletion of department with child departments', async () => {
        const existing = createDepartmentFixture();

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.findByParentId.mockResolvedValue([
          createDepartmentFixture({ id: 'child-1' }),
        ]);

        await expect(service.deleteDepartment(existing.id)).rejects.toThrow(
          DepartmentHasChildDepartmentsError,
        );
        expect(mockDepartmentRepo.countEmployeesByDepartment).not.toHaveBeenCalled();
      });

      it('should reject deletion of department with employees', async () => {
        const existing = createDepartmentFixture();

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.findByParentId.mockResolvedValue([]);
        mockDepartmentRepo.countEmployeesByDepartment.mockResolvedValue(5);

        await expect(service.deleteDepartment(existing.id)).rejects.toThrow(
          DepartmentHasEmployeesError,
        );
      });

      it('should check children before employees', async () => {
        const existing = createDepartmentFixture();

        mockDepartmentRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.findByParentId.mockResolvedValue([
          createDepartmentFixture({ id: 'child-1' }),
        ]);

        await expect(service.deleteDepartment(existing.id)).rejects.toThrow(
          DepartmentHasChildDepartmentsError,
        );
        expect(mockDepartmentRepo.countEmployeesByDepartment).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGNATION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Designation Service', () => {
    describe('getDesignation', () => {
      it('should return designation by id', async () => {
        const desig = createDesignationFixture();
        mockDesignationRepo.findById.mockResolvedValue(desig);

        const result = await service.getDesignation(desig.id);

        expect(result).toEqual(desig);
        expect(mockDesignationRepo.findById).toHaveBeenCalledWith(desig.id);
      });

      it('should throw DesignationNotFoundError for non-existent designation', async () => {
        mockDesignationRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDesignation('non-existent')).rejects.toThrow(
          DesignationNotFoundError,
        );
      });
    });

    describe('listDesignations', () => {
      it('should return paginated designations', async () => {
        const desig = createDesignationFixture();
        mockDesignationRepo.findMany.mockResolvedValue({ data: [desig], total: 1 });

        const result = await service.listDesignations(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no designations exist', async () => {
        mockDesignationRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listDesignations(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockDesignationRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDesignations(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockDesignationRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockDesignationRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDesignations(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockDesignationRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createDesignation', () => {
      it('should create designation with unique code', async () => {
        const input = createDesignationInputFixture();
        const expected = createDesignationFixture();

        mockDesignationRepo.findByCode.mockResolvedValue(undefined);
        mockDesignationRepo.create.mockResolvedValue([expected]);

        const result = await service.createDesignation(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockDesignationRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockDesignationRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate designation code', async () => {
        const input = createDesignationInputFixture();
        const existing = createDesignationFixture();

        mockDesignationRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createDesignation(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateDesignationCodeError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createDesignationInputFixture({ code: 'SR-ENG' });

        mockDesignationRepo.findByCode.mockResolvedValue(undefined);
        mockDesignationRepo.create.mockResolvedValue([createDesignationFixture()]);

        await service.createDesignation(TEST_TENANT_ID, input);

        expect(mockDesignationRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'SR-ENG');
      });
    });

    describe('updateDesignation', () => {
      it('should update designation name', async () => {
        const existing = createDesignationFixture();
        const updated = { ...existing, name: 'Staff Engineer' };

        mockDesignationRepo.findById.mockResolvedValue(existing);
        mockDesignationRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDesignation(existing.id, { name: 'Staff Engineer' });

        expect(result.name).toBe('Staff Engineer');
      });

      it('should throw DesignationNotFoundError for non-existent designation', async () => {
        mockDesignationRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateDesignation('non-existent', { name: 'Test' })).rejects.toThrow(
          DesignationNotFoundError,
        );
      });
    });

    describe('deleteDesignation', () => {
      it('should soft delete designation', async () => {
        const existing = createDesignationFixture();

        mockDesignationRepo.findById.mockResolvedValue(existing);
        mockDesignationRepo.countEmployeesByDesignation.mockResolvedValue(0);
        mockDesignationRepo.softDelete.mockResolvedValue([]);

        await service.deleteDesignation(existing.id);

        expect(mockDesignationRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw DesignationNotFoundError for non-existent designation', async () => {
        mockDesignationRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteDesignation('non-existent')).rejects.toThrow(
          DesignationNotFoundError,
        );
      });

      it('should reject deletion of designation with employees', async () => {
        const existing = createDesignationFixture();

        mockDesignationRepo.findById.mockResolvedValue(existing);
        mockDesignationRepo.countEmployeesByDesignation.mockResolvedValue(3);

        await expect(service.deleteDesignation(existing.id)).rejects.toThrow(
          DesignationHasEmployeesError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Employee Service', () => {
    describe('getEmployee', () => {
      it('should return employee by id', async () => {
        const emp = createEmployeeFixture();
        mockEmployeeRepo.findById.mockResolvedValue(emp);

        const result = await service.getEmployee(emp.id);

        expect(result).toEqual(emp);
        expect(mockEmployeeRepo.findById).toHaveBeenCalledWith(emp.id);
      });

      it('should throw EmployeeNotFoundError for non-existent employee', async () => {
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.getEmployee('non-existent')).rejects.toThrow(EmployeeNotFoundError);
      });
    });

    describe('listEmployees', () => {
      it('should return paginated employees', async () => {
        const emp = createEmployeeFixture();
        mockEmployeeRepo.findMany.mockResolvedValue({ data: [emp], total: 1 });

        const result = await service.listEmployees(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no employees exist', async () => {
        mockEmployeeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listEmployees(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockEmployeeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listEmployees(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockEmployeeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listEmployees(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createEmployee', () => {
      it('should create employee with valid input', async () => {
        const input = createEmployeeInputFixture();
        const expected = createEmployeeFixture();
        const dept = createDepartmentFixture();
        const desig = createDesignationFixture();

        mockEmployeeRepo.findByEmail.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(dept);
        mockDesignationRepo.findById.mockResolvedValue(desig);
        mockEmployeeRepo.create.mockResolvedValue([expected]);

        const result = await service.createEmployee(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockEmployeeRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate employee email', async () => {
        const input = createEmployeeInputFixture();
        const existing = createEmployeeFixture();

        mockEmployeeRepo.findByEmail.mockResolvedValue(existing);

        await expect(service.createEmployee(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateEmployeeEmailError,
        );
      });

      it('should validate department exists', async () => {
        const input = createEmployeeInputFixture({ departmentId: 'dept-non-existent' });

        mockEmployeeRepo.findByEmail.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.createEmployee(TEST_TENANT_ID, input)).rejects.toThrow(
          DepartmentNotFoundError,
        );
      });

      it('should validate designation exists', async () => {
        const input = createEmployeeInputFixture();
        const dept = createDepartmentFixture();

        mockEmployeeRepo.findByEmail.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(dept);
        mockDesignationRepo.findById.mockResolvedValue(undefined);

        await expect(service.createEmployee(TEST_TENANT_ID, input)).rejects.toThrow(
          DesignationNotFoundError,
        );
      });

      it('should validate manager exists if provided', async () => {
        const input = createEmployeeInputFixture({ managerId: 'mgr-1' });
        const dept = createDepartmentFixture();
        const desig = createDesignationFixture();

        mockEmployeeRepo.findByEmail.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(dept);
        mockDesignationRepo.findById.mockResolvedValue(desig);
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createEmployee(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should create employee with valid manager', async () => {
        const manager = createEmployeeFixture({ id: 'mgr-1' });
        const input = createEmployeeInputFixture({ managerId: 'mgr-1' });
        const expected = createEmployeeFixture({ managerId: 'mgr-1' });
        const dept = createDepartmentFixture();
        const desig = createDesignationFixture();

        mockEmployeeRepo.findByEmail.mockResolvedValue(undefined);
        mockDepartmentRepo.findById.mockResolvedValue(dept);
        mockDesignationRepo.findById.mockResolvedValue(desig);
        mockEmployeeRepo.findById.mockResolvedValue(manager);
        mockEmployeeRepo.create.mockResolvedValue([expected]);

        const result = await service.createEmployee(TEST_TENANT_ID, input);

        expect(result.managerId).toBe('mgr-1');
      });
    });

    describe('updateEmployee', () => {
      it('should update employee name', async () => {
        const existing = createEmployeeFixture();
        const updated = { ...existing, firstName: 'Jane' };

        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.update.mockResolvedValue([updated]);

        const result = await service.updateEmployee(existing.id, { firstName: 'Jane' });

        expect(result.firstName).toBe('Jane');
      });

      it('should throw EmployeeNotFoundError for non-existent employee', async () => {
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateEmployee('non-existent', { firstName: 'Jane' })).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should reject duplicate email on update', async () => {
        const existing = createEmployeeFixture({ email: 'old@example.com' });
        const duplicate = createEmployeeFixture({ id: 'emp-2', email: 'new@example.com' });

        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.findByEmail.mockResolvedValue(duplicate);

        await expect(
          service.updateEmployee(existing.id, { email: 'new@example.com' }),
        ).rejects.toThrow(DuplicateEmployeeEmailError);
      });

      it('should allow updating email to same value', async () => {
        const existing = createEmployeeFixture({ email: 'same@example.com' });
        const updated = { ...existing };

        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.update.mockResolvedValue([updated]);

        await service.updateEmployee(existing.id, { email: 'same@example.com' });

        expect(mockEmployeeRepo.findByEmail).not.toHaveBeenCalled();
      });

      it('should validate department if changing', async () => {
        const existing = createEmployeeFixture();
        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockDepartmentRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateEmployee(existing.id, { departmentId: 'dept-non-existent' }),
        ).rejects.toThrow(DepartmentNotFoundError);
      });

      it('should validate designation if changing', async () => {
        const existing = createEmployeeFixture();
        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockDesignationRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateEmployee(existing.id, { designationId: 'desig-non-existent' }),
        ).rejects.toThrow(DesignationNotFoundError);
      });

      it('should prevent self-referencing manager', async () => {
        const existing = createEmployeeFixture({ id: 'emp-1' });
        mockEmployeeRepo.findById.mockResolvedValue(existing);

        await expect(service.updateEmployee('emp-1', { managerId: 'emp-1' })).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should validate manager exists if changing', async () => {
        const existing = createEmployeeFixture();
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateEmployee(existing.id, { managerId: 'mgr-non-existent' }),
        ).rejects.toThrow(EmployeeNotFoundError);
      });

      it('should allow updating manager to null', async () => {
        const existing = createEmployeeFixture({ managerId: 'mgr-1' });
        const updated = { ...existing, managerId: null };

        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.update.mockResolvedValue([updated]);

        const result = await service.updateEmployee(existing.id, { managerId: null });

        expect(result.managerId).toBeNull();
      });
    });

    describe('deleteEmployee', () => {
      it('should soft delete employee', async () => {
        const existing = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(existing);
        mockEmployeeRepo.softDelete.mockResolvedValue([]);

        await service.deleteEmployee(existing.id);

        expect(mockEmployeeRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw EmployeeNotFoundError for non-existent employee', async () => {
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteEmployee('non-existent')).rejects.toThrow(EmployeeNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDANCE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Attendance Service', () => {
    describe('getAttendance', () => {
      it('should return attendance by id', async () => {
        const att = createAttendanceFixture();
        mockAttendanceRepo.findById.mockResolvedValue(att);

        const result = await service.getAttendance(att.id);

        expect(result).toEqual(att);
        expect(mockAttendanceRepo.findById).toHaveBeenCalledWith(att.id);
      });

      it('should throw AttendanceNotFoundError for non-existent record', async () => {
        mockAttendanceRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAttendance('non-existent')).rejects.toThrow(
          AttendanceNotFoundError,
        );
      });
    });

    describe('listAttendance', () => {
      it('should return paginated attendance records', async () => {
        const att = createAttendanceFixture();
        mockAttendanceRepo.findMany.mockResolvedValue({ data: [att], total: 1 });

        const result = await service.listAttendance(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no records exist', async () => {
        mockAttendanceRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAttendance(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockAttendanceRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAttendance(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockAttendanceRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockAttendanceRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAttendance(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockAttendanceRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createAttendance', () => {
      it('should create attendance record', async () => {
        const input = createAttendanceInputFixture();
        const expected = createAttendanceFixture();
        const emp = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockAttendanceRepo.findByEmployeeAndDate.mockResolvedValue(undefined);
        mockAttendanceRepo.create.mockResolvedValue([expected]);

        const result = await service.createAttendance(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockAttendanceRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should validate employee exists', async () => {
        const input = createAttendanceInputFixture({ employeeId: 'emp-non-existent' });

        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createAttendance(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should reject duplicate attendance for same employee and date', async () => {
        const input = createAttendanceInputFixture();
        const existing = createAttendanceFixture();
        const emp = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockAttendanceRepo.findByEmployeeAndDate.mockResolvedValue(existing);

        await expect(service.createAttendance(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateAttendanceRecordError,
        );
      });
    });

    describe('updateAttendance', () => {
      it('should update attendance record', async () => {
        const existing = createAttendanceFixture();
        const updated = { ...existing, clockOut: '18:00' };

        mockAttendanceRepo.findById.mockResolvedValue(existing);
        mockAttendanceRepo.update.mockResolvedValue([updated]);

        const result = await service.updateAttendance(existing.id, { clockOut: '18:00' });

        expect(result.clockOut).toBe('18:00');
      });

      it('should throw AttendanceNotFoundError for non-existent record', async () => {
        mockAttendanceRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateAttendance('non-existent', { clockOut: '18:00' }),
        ).rejects.toThrow(AttendanceNotFoundError);
      });
    });

    describe('deleteAttendance', () => {
      it('should delete attendance record', async () => {
        const existing = createAttendanceFixture();

        mockAttendanceRepo.findById.mockResolvedValue(existing);
        mockAttendanceRepo.delete.mockResolvedValue(undefined);

        await service.deleteAttendance(existing.id);

        expect(mockAttendanceRepo.delete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw AttendanceNotFoundError for non-existent record', async () => {
        mockAttendanceRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteAttendance('non-existent')).rejects.toThrow(
          AttendanceNotFoundError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAVE TYPE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Leave Type Service', () => {
    describe('getLeaveType', () => {
      it('should return leave type by id', async () => {
        const lt = createLeaveTypeFixture();
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);

        const result = await service.getLeaveType(lt.id);

        expect(result).toEqual(lt);
        expect(mockLeaveTypeRepo.findById).toHaveBeenCalledWith(lt.id);
      });

      it('should throw LeaveTypeNotFoundError for non-existent leave type', async () => {
        mockLeaveTypeRepo.findById.mockResolvedValue(undefined);

        await expect(service.getLeaveType('non-existent')).rejects.toThrow(LeaveTypeNotFoundError);
      });
    });

    describe('listLeaveTypes', () => {
      it('should return paginated leave types', async () => {
        const lt = createLeaveTypeFixture();
        mockLeaveTypeRepo.findMany.mockResolvedValue({ data: [lt], total: 1 });

        const result = await service.listLeaveTypes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no leave types exist', async () => {
        mockLeaveTypeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listLeaveTypes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockLeaveTypeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listLeaveTypes(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockLeaveTypeRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockLeaveTypeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listLeaveTypes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockLeaveTypeRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createLeaveType', () => {
      it('should create leave type with unique code', async () => {
        const input = createLeaveTypeInputFixture();
        const expected = createLeaveTypeFixture();

        mockLeaveTypeRepo.findByCode.mockResolvedValue(undefined);
        mockLeaveTypeRepo.create.mockResolvedValue([expected]);

        const result = await service.createLeaveType(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockLeaveTypeRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockLeaveTypeRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate leave type code', async () => {
        const input = createLeaveTypeInputFixture();
        const existing = createLeaveTypeFixture();

        mockLeaveTypeRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createLeaveType(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateLeaveTypeCodeError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createLeaveTypeInputFixture({ code: 'AL' });

        mockLeaveTypeRepo.findByCode.mockResolvedValue(undefined);
        mockLeaveTypeRepo.create.mockResolvedValue([createLeaveTypeFixture()]);

        await service.createLeaveType(TEST_TENANT_ID, input);

        expect(mockLeaveTypeRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'AL');
      });
    });

    describe('updateLeaveType', () => {
      it('should update leave type name', async () => {
        const existing = createLeaveTypeFixture();
        const updated = { ...existing, name: 'Sick Leave' };

        mockLeaveTypeRepo.findById.mockResolvedValue(existing);
        mockLeaveTypeRepo.update.mockResolvedValue([updated]);

        const result = await service.updateLeaveType(existing.id, { name: 'Sick Leave' });

        expect(result.name).toBe('Sick Leave');
      });

      it('should throw LeaveTypeNotFoundError for non-existent leave type', async () => {
        mockLeaveTypeRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateLeaveType('non-existent', { name: 'Test' })).rejects.toThrow(
          LeaveTypeNotFoundError,
        );
      });
    });

    describe('deleteLeaveType', () => {
      it('should soft delete leave type', async () => {
        const existing = createLeaveTypeFixture();

        mockLeaveTypeRepo.findById.mockResolvedValue(existing);
        mockLeaveTypeRepo.countRequestsByLeaveType.mockResolvedValue(0);
        mockLeaveTypeRepo.softDelete.mockResolvedValue([]);

        await service.deleteLeaveType(existing.id);

        expect(mockLeaveTypeRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw LeaveTypeNotFoundError for non-existent leave type', async () => {
        mockLeaveTypeRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteLeaveType('non-existent')).rejects.toThrow(
          LeaveTypeNotFoundError,
        );
      });

      it('should reject deletion of leave type with associated requests', async () => {
        const existing = createLeaveTypeFixture();

        mockLeaveTypeRepo.findById.mockResolvedValue(existing);
        mockLeaveTypeRepo.countRequestsByLeaveType.mockResolvedValue(5);

        await expect(service.deleteLeaveType(existing.id)).rejects.toThrow(
          LeaveTypeHasRequestsError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAVE REQUEST SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Leave Request Service', () => {
    describe('getLeaveRequest', () => {
      it('should return leave request by id', async () => {
        const lr = createLeaveRequestFixture();
        mockLeaveRequestRepo.findById.mockResolvedValue(lr);

        const result = await service.getLeaveRequest(lr.id);

        expect(result).toEqual(lr);
        expect(mockLeaveRequestRepo.findById).toHaveBeenCalledWith(lr.id);
      });

      it('should throw LeaveRequestNotFoundError for non-existent request', async () => {
        mockLeaveRequestRepo.findById.mockResolvedValue(undefined);

        await expect(service.getLeaveRequest('non-existent')).rejects.toThrow(
          LeaveRequestNotFoundError,
        );
      });
    });

    describe('listLeaveRequests', () => {
      it('should return paginated leave requests', async () => {
        const lr = createLeaveRequestFixture();
        mockLeaveRequestRepo.findMany.mockResolvedValue({ data: [lr], total: 1 });

        const result = await service.listLeaveRequests(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no requests exist', async () => {
        mockLeaveRequestRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listLeaveRequests(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockLeaveRequestRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listLeaveRequests(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockLeaveRequestRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockLeaveRequestRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listLeaveRequests(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockLeaveRequestRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createLeaveRequest', () => {
      it('should create leave request with valid input', async () => {
        const input = createLeaveRequestInputFixture();
        const expected = createLeaveRequestFixture();
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);
        mockLeaveRequestRepo.create.mockResolvedValue([expected]);

        const result = await service.createLeaveRequest(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockLeaveRequestRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID, status: 'pending' }),
        );
      });

      it('should validate employee exists', async () => {
        const input = createLeaveRequestInputFixture({ employeeId: 'emp-non-existent' });

        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should reject leave request for inactive employee', async () => {
        const input = createLeaveRequestInputFixture();
        const inactiveEmp = createEmployeeFixture({ status: 'inactive', managerId: TEST_USER_ID });

        mockEmployeeRepo.findById.mockResolvedValue(inactiveEmp);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotActiveError,
        );
      });

      it('should enforce BR-006: require manager for leave request', async () => {
        const input = createLeaveRequestInputFixture();
        const empNoManager = createEmployeeFixture({ managerId: null });

        mockEmployeeRepo.findById.mockResolvedValue(empNoManager);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          LeaveRequestRequiresManagerError,
        );
      });

      it('should validate leave type exists', async () => {
        const input = createLeaveRequestInputFixture({ leaveTypeId: 'lt-non-existent' });
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          LeaveTypeNotFoundError,
        );
      });

      it('should reject leave request with end date before start date', async () => {
        const input = createLeaveRequestInputFixture({
          startDate: '2026-08-10',
          endDate: '2026-08-01',
        });
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          InvalidLeaveDateRangeError,
        );
      });

      it('should allow leave request with same start and end date', async () => {
        const input = createLeaveRequestInputFixture({
          startDate: '2026-08-01',
          endDate: '2026-08-01',
          totalDays: 1,
        });
        const expected = createLeaveRequestFixture({
          startDate: '2026-08-01',
          endDate: '2026-08-01',
          totalDays: 1,
        });
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);
        mockLeaveRequestRepo.create.mockResolvedValue([expected]);

        const result = await service.createLeaveRequest(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
      });

      it('should reject leave request with zero total days', async () => {
        const input = createLeaveRequestInputFixture({ totalDays: 0 });
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          InvalidLeaveDaysError,
        );
      });

      it('should reject leave request with negative total days', async () => {
        const input = createLeaveRequestInputFixture({ totalDays: -5 });
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);

        await expect(service.createLeaveRequest(TEST_TENANT_ID, input)).rejects.toThrow(
          InvalidLeaveDaysError,
        );
      });

      it('should set status to pending on creation', async () => {
        const input = createLeaveRequestInputFixture();
        const emp = createEmployeeFixture({ managerId: TEST_USER_ID });
        const lt = createLeaveTypeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockLeaveTypeRepo.findById.mockResolvedValue(lt);
        mockLeaveRequestRepo.create.mockResolvedValue([createLeaveRequestFixture()]);

        await service.createLeaveRequest(TEST_TENANT_ID, input);

        expect(mockLeaveRequestRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'pending' }),
        );
      });
    });

    describe('approveRejectLeaveRequest', () => {
      it('should approve a pending leave request', async () => {
        const request = createLeaveRequestFixture({ status: 'pending' });
        const employee = createEmployeeFixture({ id: request.employeeId, managerId: TEST_USER_ID });
        const updated = {
          ...request,
          status: 'approved' as const,
          approvedBy: TEST_USER_ID,
          approvedAt: new Date(),
        };

        mockLeaveRequestRepo.findById.mockResolvedValue(request);
        mockEmployeeRepo.findById.mockResolvedValue(employee);
        mockLeaveRequestRepo.update.mockResolvedValue([updated]);

        const result = await service.approveRejectLeaveRequest(request.id, TEST_USER_ID, {
          status: 'approved',
        });

        expect(result.status).toBe('approved');
        expect(mockLeaveRequestRepo.update).toHaveBeenCalledWith(
          request.id,
          expect.objectContaining({
            status: 'approved',
            approvedBy: TEST_USER_ID,
            approvedAt: expect.any(Date),
          }),
        );
      });

      it('should reject a pending leave request with reason', async () => {
        const request = createLeaveRequestFixture({ status: 'pending' });
        const employee = createEmployeeFixture({ id: request.employeeId, managerId: TEST_USER_ID });
        const updated = {
          ...request,
          status: 'rejected' as const,
          approvedBy: TEST_USER_ID,
          approvedAt: new Date(),
          rejectionReason: 'Insufficient coverage',
        };

        mockLeaveRequestRepo.findById.mockResolvedValue(request);
        mockEmployeeRepo.findById.mockResolvedValue(employee);
        mockLeaveRequestRepo.update.mockResolvedValue([updated]);

        const result = await service.approveRejectLeaveRequest(request.id, TEST_USER_ID, {
          status: 'rejected',
          rejectionReason: 'Insufficient coverage',
        });

        expect(result.status).toBe('rejected');
        expect(mockLeaveRequestRepo.update).toHaveBeenCalledWith(
          request.id,
          expect.objectContaining({
            status: 'rejected',
            approvedBy: TEST_USER_ID,
            rejectionReason: 'Insufficient coverage',
          }),
        );
      });

      it('should throw LeaveRequestNotFoundError for non-existent request', async () => {
        mockLeaveRequestRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.approveRejectLeaveRequest('non-existent', TEST_USER_ID, { status: 'approved' }),
        ).rejects.toThrow(LeaveRequestNotFoundError);
      });

      it('should reject modification of already approved request', async () => {
        const request = createLeaveRequestFixture({ status: 'approved' });
        mockLeaveRequestRepo.findById.mockResolvedValue(request);

        await expect(
          service.approveRejectLeaveRequest(request.id, TEST_USER_ID, { status: 'rejected' }),
        ).rejects.toThrow(LeaveRequestAlreadyProcessedError);
      });

      it('should reject modification of already rejected request', async () => {
        const request = createLeaveRequestFixture({ status: 'rejected' });
        mockLeaveRequestRepo.findById.mockResolvedValue(request);

        await expect(
          service.approveRejectLeaveRequest(request.id, TEST_USER_ID, { status: 'approved' }),
        ).rejects.toThrow(LeaveRequestAlreadyProcessedError);
      });

      it('should enforce BR-006: only manager can approve/reject', async () => {
        const request = createLeaveRequestFixture({ status: 'pending' });
        const employee = createEmployeeFixture({
          id: request.employeeId,
          managerId: 'real-manager-id',
        });

        mockLeaveRequestRepo.findById.mockResolvedValue(request);
        mockEmployeeRepo.findById.mockResolvedValue(employee);

        await expect(
          service.approveRejectLeaveRequest(request.id, 'wrong-user-id', { status: 'approved' }),
        ).rejects.toThrow(NotAuthorizedForLeaveApprovalError);
      });

      it('should throw EmployeeNotFoundError if employee not found during approval', async () => {
        const request = createLeaveRequestFixture({ status: 'pending' });

        mockLeaveRequestRepo.findById.mockResolvedValue(request);
        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.approveRejectLeaveRequest(request.id, TEST_USER_ID, { status: 'approved' }),
        ).rejects.toThrow(EmployeeNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SALARY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Salary Service', () => {
    describe('getSalary', () => {
      it('should return salary by id', async () => {
        const sal = createSalaryFixture();
        mockSalaryRepo.findById.mockResolvedValue(sal);

        const result = await service.getSalary(sal.id);

        expect(result).toEqual(sal);
        expect(mockSalaryRepo.findById).toHaveBeenCalledWith(sal.id);
      });

      it('should throw SalaryNotFoundError for non-existent salary', async () => {
        mockSalaryRepo.findById.mockResolvedValue(undefined);

        await expect(service.getSalary('non-existent')).rejects.toThrow(SalaryNotFoundError);
      });
    });

    describe('listSalaries', () => {
      it('should return paginated salaries', async () => {
        const sal = createSalaryFixture();
        mockSalaryRepo.findMany.mockResolvedValue({ data: [sal], total: 1 });

        const result = await service.listSalaries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no salaries exist', async () => {
        mockSalaryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listSalaries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockSalaryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listSalaries(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockSalaryRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockSalaryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listSalaries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockSalaryRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createSalary', () => {
      it('should create salary for employee without existing salary', async () => {
        const input = createSalaryInputFixture();
        const expected = createSalaryFixture();
        const emp = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockSalaryRepo.findByEmployee.mockResolvedValue(undefined);
        mockSalaryRepo.create.mockResolvedValue([expected]);

        const result = await service.createSalary(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockSalaryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should validate employee exists', async () => {
        const input = createSalaryInputFixture({ employeeId: 'emp-non-existent' });

        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createSalary(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should reject salary creation for employee who already has salary', async () => {
        const input = createSalaryInputFixture();
        const emp = createEmployeeFixture();
        const existingSalary = createSalaryFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockSalaryRepo.findByEmployee.mockResolvedValue(existingSalary);

        await expect(service.createSalary(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeAlreadyHasSalaryError,
        );
      });
    });

    describe('updateSalary', () => {
      it('should update salary', async () => {
        const existing = createSalaryFixture();
        const updated = { ...existing, basicSalary: '85000' };

        mockSalaryRepo.findById.mockResolvedValue(existing);
        mockSalaryRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalary(existing.id, { basicSalary: '85000' });

        expect(result.basicSalary).toBe('85000');
      });

      it('should throw SalaryNotFoundError for non-existent salary', async () => {
        mockSalaryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateSalary('non-existent', { basicSalary: '85000' }),
        ).rejects.toThrow(SalaryNotFoundError);
      });
    });

    describe('deleteSalary', () => {
      it('should soft delete salary', async () => {
        const existing = createSalaryFixture();

        mockSalaryRepo.findById.mockResolvedValue(existing);
        mockSalaryRepo.softDelete.mockResolvedValue([]);

        await service.deleteSalary(existing.id);

        expect(mockSalaryRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw SalaryNotFoundError for non-existent salary', async () => {
        mockSalaryRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteSalary('non-existent')).rejects.toThrow(SalaryNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYROLL SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Payroll Service', () => {
    describe('getPayroll', () => {
      it('should return payroll by id', async () => {
        const pay = createPayrollFixture();
        mockPayrollRepo.findById.mockResolvedValue(pay);

        const result = await service.getPayroll(pay.id);

        expect(result).toEqual(pay);
        expect(mockPayrollRepo.findById).toHaveBeenCalledWith(pay.id);
      });

      it('should throw PayrollNotFoundError for non-existent payroll', async () => {
        mockPayrollRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPayroll('non-existent')).rejects.toThrow(PayrollNotFoundError);
      });
    });

    describe('listPayroll', () => {
      it('should return paginated payroll records', async () => {
        const pay = createPayrollFixture();
        mockPayrollRepo.findMany.mockResolvedValue({ data: [pay], total: 1 });

        const result = await service.listPayroll(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no payroll records exist', async () => {
        mockPayrollRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listPayroll(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockPayrollRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPayroll(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockPayrollRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockPayrollRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPayroll(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockPayrollRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createPayroll', () => {
      it('should create payroll and calculate net pay', async () => {
        const input = createPayrollInputFixture({
          basicSalary: '6250',
          allowances: '500',
          deductions: '750',
        });
        const expected = createPayrollFixture({ netPay: '6000', status: 'draft' });
        const emp = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockPayrollRepo.findByEmployeeAndPeriod.mockResolvedValue(undefined);
        mockPayrollRepo.create.mockResolvedValue([expected]);

        const result = await service.createPayroll(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockPayrollRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            netPay: '6000',
            status: 'draft',
          }),
        );
      });

      it('should validate employee exists', async () => {
        const input = createPayrollInputFixture({ employeeId: 'emp-non-existent' });

        mockEmployeeRepo.findById.mockResolvedValue(undefined);

        await expect(service.createPayroll(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotFoundError,
        );
      });

      it('should reject payroll for inactive employee', async () => {
        const input = createPayrollInputFixture();
        const inactiveEmp = createEmployeeFixture({ status: 'inactive' });

        mockEmployeeRepo.findById.mockResolvedValue(inactiveEmp);

        await expect(service.createPayroll(TEST_TENANT_ID, input)).rejects.toThrow(
          EmployeeNotActiveError,
        );
      });

      it('should reject payroll with invalid period (end before start)', async () => {
        const input = createPayrollInputFixture({
          payPeriodStart: '2026-07-31',
          payPeriodEnd: '2026-07-01',
        });
        const emp = createEmployeeFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);

        await expect(service.createPayroll(TEST_TENANT_ID, input)).rejects.toThrow(
          PayrollInvalidPeriodError,
        );
      });

      it('should allow payroll with same start and end date', async () => {
        const input = createPayrollInputFixture({
          payPeriodStart: '2026-07-01',
          payPeriodEnd: '2026-07-01',
        });
        const emp = createEmployeeFixture();
        const expected = createPayrollFixture({
          payPeriodStart: '2026-07-01',
          payPeriodEnd: '2026-07-01',
        });

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockPayrollRepo.findByEmployeeAndPeriod.mockResolvedValue(undefined);
        mockPayrollRepo.create.mockResolvedValue([expected]);

        const result = await service.createPayroll(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
      });

      it('should reject duplicate payroll for same employee and period', async () => {
        const input = createPayrollInputFixture();
        const emp = createEmployeeFixture();
        const existingPayroll = createPayrollFixture();

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockPayrollRepo.findByEmployeeAndPeriod.mockResolvedValue(existingPayroll);

        await expect(service.createPayroll(TEST_TENANT_ID, input)).rejects.toThrow(
          PayrollAlreadyProcessedError,
        );
      });

      it('should calculate net pay with zero allowances and deductions', async () => {
        const input = createPayrollInputFixture({
          basicSalary: '5000',
          allowances: undefined,
          deductions: undefined,
        });
        const emp = createEmployeeFixture();
        const expected = createPayrollFixture({ basicSalary: '5000', netPay: '5000' });

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockPayrollRepo.findByEmployeeAndPeriod.mockResolvedValue(undefined);
        mockPayrollRepo.create.mockResolvedValue([expected]);

        await service.createPayroll(TEST_TENANT_ID, input);

        expect(mockPayrollRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ netPay: '5000' }),
        );
      });

      it('should set status to draft on creation', async () => {
        const input = createPayrollInputFixture();
        const emp = createEmployeeFixture();
        const expected = createPayrollFixture({ status: 'draft' });

        mockEmployeeRepo.findById.mockResolvedValue(emp);
        mockPayrollRepo.findByEmployeeAndPeriod.mockResolvedValue(undefined);
        mockPayrollRepo.create.mockResolvedValue([expected]);

        await service.createPayroll(TEST_TENANT_ID, input);

        expect(mockPayrollRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
        );
      });
    });

    describe('updatePayroll', () => {
      it('should update payroll and recalculate net pay', async () => {
        const existing = createPayrollFixture({
          basicSalary: '6250',
          allowances: '500',
          deductions: '750',
        });
        const updated = { ...existing, basicSalary: '7000', netPay: '6750' };

        mockPayrollRepo.findById.mockResolvedValue(existing);
        mockPayrollRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayroll(existing.id, { basicSalary: '7000' });

        expect(result.basicSalary).toBe('7000');
        expect(mockPayrollRepo.update).toHaveBeenCalledWith(
          existing.id,
          expect.objectContaining({ basicSalary: '7000', netPay: '6750' }),
        );
      });

      it('should throw PayrollNotFoundError for non-existent payroll', async () => {
        mockPayrollRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updatePayroll('non-existent', { basicSalary: '7000' }),
        ).rejects.toThrow(PayrollNotFoundError);
      });

      it('should use existing values when fields not provided', async () => {
        const existing = createPayrollFixture({
          basicSalary: '6250',
          allowances: '500',
          deductions: '750',
        });
        const updated = { ...existing, basicSalary: '7000' };

        mockPayrollRepo.findById.mockResolvedValue(existing);
        mockPayrollRepo.update.mockResolvedValue([updated]);

        await service.updatePayroll(existing.id, { basicSalary: '7000' });

        // netPay = 7000 + 500 - 750 = 6750
        expect(mockPayrollRepo.update).toHaveBeenCalledWith(
          existing.id,
          expect.objectContaining({ netPay: '6750' }),
        );
      });
    });

    describe('processPayroll', () => {
      it('should process draft payroll', async () => {
        const existing = createPayrollFixture({ status: 'draft' });
        const updated = { ...existing, status: 'processed', processedAt: new Date() };

        mockPayrollRepo.findById.mockResolvedValue(existing);
        mockPayrollRepo.update.mockResolvedValue([updated]);

        const result = await service.processPayroll(existing.id);

        expect(result.status).toBe('processed');
        expect(mockPayrollRepo.update).toHaveBeenCalledWith(
          existing.id,
          expect.objectContaining({
            status: 'processed',
            processedAt: expect.any(Date),
          }),
        );
      });

      it('should throw PayrollNotFoundError for non-existent payroll', async () => {
        mockPayrollRepo.findById.mockResolvedValue(undefined);

        await expect(service.processPayroll('non-existent')).rejects.toThrow(PayrollNotFoundError);
      });

      it('should reject processing already processed payroll', async () => {
        const existing = createPayrollFixture({ status: 'processed' });
        mockPayrollRepo.findById.mockResolvedValue(existing);

        await expect(service.processPayroll(existing.id)).rejects.toThrow(
          PayrollAlreadyProcessedError,
        );
      });
    });

    describe('deletePayroll', () => {
      it('should soft delete payroll', async () => {
        const existing = createPayrollFixture();

        mockPayrollRepo.findById.mockResolvedValue(existing);
        mockPayrollRepo.softDelete.mockResolvedValue([]);

        await service.deletePayroll(existing.id);

        expect(mockPayrollRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw PayrollNotFoundError for non-existent payroll', async () => {
        mockPayrollRepo.findById.mockResolvedValue(undefined);

        await expect(service.deletePayroll('non-existent')).rejects.toThrow(PayrollNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYSLIP SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Payslip Service', () => {
    describe('getPayslip', () => {
      it('should return payslip by id', async () => {
        const ps = createPayslipFixture();
        mockPayslipRepo.findById.mockResolvedValue(ps);

        const result = await service.getPayslip(ps.id);

        expect(result).toEqual(ps);
        expect(mockPayslipRepo.findById).toHaveBeenCalledWith(ps.id);
      });

      it('should throw PayrollNotFoundError for non-existent payslip', async () => {
        mockPayslipRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPayslip('non-existent')).rejects.toThrow(PayrollNotFoundError);
      });
    });

    describe('listPayslips', () => {
      it('should return paginated payslips', async () => {
        const ps = createPayslipFixture();
        mockPayslipRepo.findMany.mockResolvedValue({ data: [ps], total: 1 });

        const result = await service.listPayslips(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no payslips exist', async () => {
        mockPayslipRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listPayslips(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockPayslipRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPayslips(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockPayslipRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockPayslipRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPayslips(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockPayslipRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TENANT ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tenant Isolation', () => {
    it('should pass tenantId to departmentRepo.findMany for listDepartments', async () => {
      mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listDepartments(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockDepartmentRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to departmentRepo.findByCode for createDepartment', async () => {
      mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
      mockDepartmentRepo.create.mockResolvedValue([createDepartmentFixture()]);

      await service.createDepartment(TEST_TENANT_ID, createDepartmentInputFixture());

      expect(mockDepartmentRepo.findByCode).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.any(String),
      );
    });

    it('should pass tenantId to departmentRepo.create for createDepartment', async () => {
      mockDepartmentRepo.findByCode.mockResolvedValue(undefined);
      mockDepartmentRepo.create.mockResolvedValue([createDepartmentFixture()]);

      await service.createDepartment(TEST_TENANT_ID, createDepartmentInputFixture());

      expect(mockDepartmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to designationRepo.findMany for listDesignations', async () => {
      mockDesignationRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listDesignations(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockDesignationRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to employeeRepo.findMany for listEmployees', async () => {
      mockEmployeeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listEmployees(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to attendanceRepo.findMany for listAttendance', async () => {
      mockAttendanceRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listAttendance(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockAttendanceRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to leaveTypeRepo.findMany for listLeaveTypes', async () => {
      mockLeaveTypeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listLeaveTypes(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockLeaveTypeRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to leaveRequestRepo.findMany for listLeaveRequests', async () => {
      mockLeaveRequestRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listLeaveRequests(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockLeaveRequestRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to salaryRepo.findMany for listSalaries', async () => {
      mockSalaryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listSalaries(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockSalaryRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to payrollRepo.findMany for listPayroll', async () => {
      mockPayrollRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listPayroll(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockPayrollRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to payslipRepo.findMany for listPayslips', async () => {
      mockPayslipRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listPayslips(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockPayslipRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should isolate department lookups between tenants', async () => {
      mockDepartmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listDepartments(OTHER_TENANT_ID, { page: 1, limit: 20 });

      expect(mockDepartmentRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: OTHER_TENANT_ID }),
      );
    });

    it('should isolate employee lookups between tenants', async () => {
      mockEmployeeRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listEmployees(OTHER_TENANT_ID, { page: 1, limit: 20 });

      expect(mockEmployeeRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: OTHER_TENANT_ID }),
      );
    });
  });
});
