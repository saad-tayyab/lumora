import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID, createMockSession } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('not_found', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('invalid_argument', message, { status: 400 });
    }
    static internal(message: string) {
      return new MockAPIError('internal', message, { status: 500 });
    }
    static forbidden(message: string) {
      return new MockAPIError('permission_denied', message, { status: 403 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

const mockGetAuthData = vi.fn();
vi.mock('encore.dev/internal/codegen/auth', () => ({
  getAuthData: () => mockGetAuthData(),
}));

vi.mock('./service', () => ({
  getDepartment: vi.fn(),
  listDepartments: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  getDesignation: vi.fn(),
  listDesignations: vi.fn(),
  createDesignation: vi.fn(),
  updateDesignation: vi.fn(),
  deleteDesignation: vi.fn(),
  getEmployee: vi.fn(),
  listEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getAttendance: vi.fn(),
  listAttendance: vi.fn(),
  createAttendance: vi.fn(),
  updateAttendance: vi.fn(),
  deleteAttendance: vi.fn(),
  getLeaveType: vi.fn(),
  listLeaveTypes: vi.fn(),
  createLeaveType: vi.fn(),
  updateLeaveType: vi.fn(),
  deleteLeaveType: vi.fn(),
  getLeaveRequest: vi.fn(),
  listLeaveRequests: vi.fn(),
  createLeaveRequest: vi.fn(),
  approveRejectLeaveRequest: vi.fn(),
  getSalary: vi.fn(),
  listSalaries: vi.fn(),
  createSalary: vi.fn(),
  updateSalary: vi.fn(),
  deleteSalary: vi.fn(),
  getPayroll: vi.fn(),
  listPayroll: vi.fn(),
  createPayroll: vi.fn(),
  updatePayroll: vi.fn(),
  processPayroll: vi.fn(),
  deletePayroll: vi.fn(),
  getPayslip: vi.fn(),
  listPayslips: vi.fn(),
}));

import * as api from './api';
import * as service from './service';

// ─── Test Data ───────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '550e8400-e29b-41d4-a716-446655440001';
const UUID3 = '550e8400-e29b-41d4-a716-446655440002';

const mockDepartment = {
  id: UUID,
  name: 'Engineering',
  code: 'ENG',
  description: 'Engineering department',
  headId: null,
  parentId: null,
  status: 'active' as const,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockDesignation = {
  id: UUID,
  name: 'Software Engineer',
  code: 'SE',
  description: 'Software engineer role',
  level: 3,
  salaryBandMin: '50000',
  salaryBandMax: '120000',
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockEmployee = {
  id: UUID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  hireDate: '2026-01-15',
  departmentId: UUID2,
  designationId: UUID3,
  managerId: null,
  employmentType: 'full_time' as const,
  status: 'active' as const,
  userId: null,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockAttendance = {
  id: UUID,
  employeeId: UUID2,
  date: '2026-01-15',
  clockIn: '2026-01-15T09:00:00.000Z',
  clockOut: '2026-01-15T17:00:00.000Z',
  status: 'present' as const,
  hoursWorked: '8',
  overtimeHours: '0',
  notes: null,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockLeaveType = {
  id: UUID,
  name: 'Annual Leave',
  code: 'AL',
  daysPerYear: 20,
  isPaid: true,
  carryForward: false,
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockLeaveRequest = {
  id: UUID,
  employeeId: UUID2,
  leaveTypeId: UUID3,
  startDate: '2026-02-01',
  endDate: '2026-02-05',
  totalDays: 5,
  reason: 'Vacation',
  status: 'pending' as const,
  approvedBy: null,
  rejectionReason: null,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockSalary = {
  id: UUID,
  employeeId: UUID2,
  basicSalary: '75000',
  currency: 'USD',
  payFrequency: 'monthly' as const,
  effectiveDate: '2026-01-01',
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPayroll = {
  id: UUID,
  employeeId: UUID2,
  payPeriodStart: '2026-01-01',
  payPeriodEnd: '2026-01-31',
  basicSalary: '75000',
  allowances: '5000',
  deductions: '2000',
  netPay: '78000',
  status: 'draft' as const,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPayslip = {
  id: UUID,
  payrollId: UUID2,
  employeeId: UUID3,
  payPeriodStart: '2026-01-01',
  payPeriodEnd: '2026-01-31',
  basicSalary: '75000',
  allowances: '5000',
  deductions: '2000',
  netPay: '78000',
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HR API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue(createMockSession());
  });

  // ─── Departments ─────────────────────────────────────────────────────────

  describe('getDepartment', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      const result = await (api.getDepartment as Function)({ id: UUID });

      expect(service.getDepartment).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockDepartment);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getDepartment as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Department with id xyz not found'),
      );

      await expect((api.getDepartment as Function)({ id: 'xyz' })).rejects.toThrow(
        'Department with id xyz not found',
      );
    });
  });

  describe('listDepartments', () => {
    const listResult = { data: [mockDepartment], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listDepartments as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listDepartments as Function)({});

      expect(service.listDepartments).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listDepartments as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listDepartments as Function)({ page: 2, limit: 10 });

      expect(service.listDepartments).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listDepartments as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects invalid page value', async () => {
      await expect((api.listDepartments as Function)({ page: -1 })).rejects.toThrow();
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listDepartments as Function)({ limit: 200 })).rejects.toThrow();
    });

    it('rejects non-integer page', async () => {
      await expect((api.listDepartments as Function)({ page: 1.5 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listDepartments as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listDepartments as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createDepartment', () => {
    const validReq = { name: 'Engineering', code: 'ENG' };

    it('calls service with correct args when authenticated', async () => {
      (service.createDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      const result = await (api.createDepartment as Function)(validReq);

      expect(service.createDepartment).toHaveBeenCalledWith(TEST_TENANT_ID, {
        name: 'Engineering',
        code: 'ENG',
        description: undefined,
        headId: undefined,
        parentId: undefined,
        status: undefined,
      });
      expect(result).toEqual(mockDepartment);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createDepartment as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when name is missing', async () => {
      await expect((api.createDepartment as Function)({ code: 'ENG' })).rejects.toThrow();
    });

    it('throws ValidationError when code is missing', async () => {
      await expect((api.createDepartment as Function)({ name: 'Engineering' })).rejects.toThrow();
    });

    it('throws ValidationError when name is empty string', async () => {
      await expect((api.createDepartment as Function)({ name: '', code: 'ENG' })).rejects.toThrow();
    });

    it('throws ValidationError when code is empty string', async () => {
      await expect(
        (api.createDepartment as Function)({ name: 'Engineering', code: '' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when name exceeds 100 chars', async () => {
      await expect(
        (api.createDepartment as Function)({ name: 'x'.repeat(101), code: 'ENG' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when code exceeds 20 chars', async () => {
      await expect(
        (api.createDepartment as Function)({ name: 'Engineering', code: 'x'.repeat(21) }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when headId is not a UUID', async () => {
      await expect(
        (api.createDepartment as Function)({ name: 'Engineering', code: 'ENG', headId: 'not-uuid' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when parentId is not a UUID', async () => {
      await expect(
        (api.createDepartment as Function)({
          name: 'Engineering',
          code: 'ENG',
          parentId: 'not-uuid',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when status is invalid', async () => {
      await expect(
        (api.createDepartment as Function)({ name: 'Engineering', code: 'ENG', status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('accepts valid optional fields', async () => {
      (service.createDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      await (api.createDepartment as Function)({
        name: 'Engineering',
        code: 'ENG',
        description: 'Main department',
        headId: UUID2,
        parentId: UUID3,
        status: 'active',
      });

      expect(service.createDepartment).toHaveBeenCalledWith(TEST_TENANT_ID, {
        name: 'Engineering',
        code: 'ENG',
        description: 'Main department',
        headId: UUID2,
        parentId: UUID3,
        status: 'active',
      });
    });

    it('propagates service errors', async () => {
      (service.createDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Department code already exists'),
      );

      await expect((api.createDepartment as Function)(validReq)).rejects.toThrow(
        'Department code already exists',
      );
    });
  });

  describe('updateDepartment', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      const result = await (api.updateDepartment as Function)({ id: UUID, name: 'Updated' });

      expect(service.updateDepartment).toHaveBeenCalledWith(UUID, { name: 'Updated' });
      expect(result).toEqual(mockDepartment);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateDepartment as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateDepartment as Function)({ id: UUID, name: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('rejects description that is too long', async () => {
      await expect(
        (api.updateDepartment as Function)({ id: UUID, description: 'x'.repeat(501) }),
      ).rejects.toThrow();
    });

    it('rejects invalid status value', async () => {
      await expect(
        (api.updateDepartment as Function)({ id: UUID, status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('allows setting headId to null', async () => {
      (service.updateDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      await (api.updateDepartment as Function)({ id: UUID, headId: null });

      expect(service.updateDepartment).toHaveBeenCalledWith(UUID, { headId: null });
    });

    it('allows setting parentId to null', async () => {
      (service.updateDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(mockDepartment);

      await (api.updateDepartment as Function)({ id: UUID, parentId: null });

      expect(service.updateDepartment).toHaveBeenCalledWith(UUID, { parentId: null });
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Department with id xyz not found'),
      );

      await expect(
        (api.updateDepartment as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Department with id xyz not found');
    });

    it('propagates duplicate code error', async () => {
      (service.updateDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Department code already exists'),
      );

      await expect(
        (api.updateDepartment as Function)({ id: UUID, name: 'Duplicate' }),
      ).rejects.toThrow('Department code already exists');
    });
  });

  describe('deleteDepartment', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteDepartment as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteDepartment as Function)({ id: UUID });

      expect(service.deleteDepartment).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteDepartment as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Department with id xyz not found'),
      );

      await expect((api.deleteDepartment as Function)({ id: 'xyz' })).rejects.toThrow(
        'Department with id xyz not found',
      );
    });

    it('propagates error when department has employees', async () => {
      (service.deleteDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete department with employees'),
      );

      await expect((api.deleteDepartment as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete department with employees',
      );
    });

    it('propagates error when department has child departments', async () => {
      (service.deleteDepartment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete department with child departments'),
      );

      await expect((api.deleteDepartment as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete department with child departments',
      );
    });
  });

  // ─── Designations ────────────────────────────────────────────────────────

  describe('getDesignation', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(mockDesignation);

      const result = await (api.getDesignation as Function)({ id: UUID });

      expect(service.getDesignation).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockDesignation);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getDesignation as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getDesignation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Designation with id xyz not found'),
      );

      await expect((api.getDesignation as Function)({ id: 'xyz' })).rejects.toThrow(
        'Designation with id xyz not found',
      );
    });
  });

  describe('listDesignations', () => {
    const listResult = { data: [mockDesignation], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listDesignations as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listDesignations as Function)({});

      expect(service.listDesignations).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listDesignations as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listDesignations as Function)({ page: 3, limit: 5 });

      expect(service.listDesignations).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 3,
        limit: 5,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listDesignations as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listDesignations as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listDesignations as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listDesignations as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createDesignation', () => {
    const validReq = { name: 'Software Engineer', code: 'SE' };

    it('calls service with correct args when authenticated', async () => {
      (service.createDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(mockDesignation);

      const result = await (api.createDesignation as Function)(validReq);

      expect(service.createDesignation).toHaveBeenCalledWith(TEST_TENANT_ID, {
        name: 'Software Engineer',
        code: 'SE',
        description: undefined,
        level: undefined,
        salaryBandMin: undefined,
        salaryBandMax: undefined,
        isActive: undefined,
      });
      expect(result).toEqual(mockDesignation);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createDesignation as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when name is missing', async () => {
      await expect((api.createDesignation as Function)({ code: 'SE' })).rejects.toThrow();
    });

    it('throws ValidationError when code is missing', async () => {
      await expect(
        (api.createDesignation as Function)({ name: 'Software Engineer' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when level is not an integer', async () => {
      await expect(
        (api.createDesignation as Function)({ name: 'SE', code: 'SE', level: 1.5 }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when level is less than 1', async () => {
      await expect(
        (api.createDesignation as Function)({ name: 'SE', code: 'SE', level: 0 }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createDesignation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Designation code already exists'),
      );

      await expect((api.createDesignation as Function)(validReq)).rejects.toThrow(
        'Designation code already exists',
      );
    });
  });

  describe('updateDesignation', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(mockDesignation);

      const result = await (api.updateDesignation as Function)({ id: UUID, name: 'Updated' });

      expect(service.updateDesignation).toHaveBeenCalledWith(UUID, { name: 'Updated' });
      expect(result).toEqual(mockDesignation);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateDesignation as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateDesignation as Function)({ id: UUID, name: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('allows setting salaryBandMin to null', async () => {
      (service.updateDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(mockDesignation);

      await (api.updateDesignation as Function)({ id: UUID, salaryBandMin: null });

      expect(service.updateDesignation).toHaveBeenCalledWith(UUID, { salaryBandMin: null });
    });

    it('allows setting salaryBandMax to null', async () => {
      (service.updateDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(mockDesignation);

      await (api.updateDesignation as Function)({ id: UUID, salaryBandMax: null });

      expect(service.updateDesignation).toHaveBeenCalledWith(UUID, { salaryBandMax: null });
    });

    it('allows setting isActive to false', async () => {
      (service.updateDesignation as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockDesignation,
        isActive: false,
      });

      await (api.updateDesignation as Function)({ id: UUID, isActive: false });

      expect(service.updateDesignation).toHaveBeenCalledWith(UUID, { isActive: false });
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateDesignation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Designation with id xyz not found'),
      );

      await expect(
        (api.updateDesignation as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Designation with id xyz not found');
    });
  });

  describe('deleteDesignation', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteDesignation as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteDesignation as Function)({ id: UUID });

      expect(service.deleteDesignation).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteDesignation as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteDesignation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Designation with id xyz not found'),
      );

      await expect((api.deleteDesignation as Function)({ id: 'xyz' })).rejects.toThrow(
        'Designation with id xyz not found',
      );
    });

    it('propagates error when designation has employees', async () => {
      (service.deleteDesignation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete designation with employees'),
      );

      await expect((api.deleteDesignation as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete designation with employees',
      );
    });
  });

  // ─── Employees ───────────────────────────────────────────────────────────

  describe('getEmployee', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      const result = await (api.getEmployee as Function)({ id: UUID });

      expect(service.getEmployee).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockEmployee);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getEmployee as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getEmployee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Employee with id xyz not found'),
      );

      await expect((api.getEmployee as Function)({ id: 'xyz' })).rejects.toThrow(
        'Employee with id xyz not found',
      );
    });
  });

  describe('listEmployees', () => {
    const listResult = { data: [mockEmployee], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listEmployees as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listEmployees as Function)({});

      expect(service.listEmployees).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listEmployees as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listEmployees as Function)({ page: 2, limit: 5 });

      expect(service.listEmployees).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 5,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listEmployees as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects negative page', async () => {
      await expect((api.listEmployees as Function)({ page: -1 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listEmployees as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listEmployees as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createEmployee', () => {
    const validReq = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      hireDate: '2026-01-15',
      departmentId: UUID2,
      designationId: UUID3,
      employmentType: 'full_time',
    };

    it('calls service with correct args when authenticated', async () => {
      (service.createEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      const result = await (api.createEmployee as Function)(validReq);

      expect(service.createEmployee).toHaveBeenCalledWith(TEST_TENANT_ID, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: undefined,
        hireDate: '2026-01-15',
        departmentId: UUID2,
        designationId: UUID3,
        managerId: undefined,
        employmentType: 'full_time',
        status: undefined,
        userId: undefined,
      });
      expect(result).toEqual(mockEmployee);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createEmployee as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when firstName is missing', async () => {
      await expect(
        (api.createEmployee as Function)({
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when lastName is missing', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when email is invalid', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-an-email',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when hireDate format is invalid', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '15-01-2026',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when departmentId is not a UUID', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: 'not-uuid',
          designationId: UUID3,
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when designationId is not a UUID', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: 'not-uuid',
          employmentType: 'full_time',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when employmentType is invalid', async () => {
      await expect(
        (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: 'invalid',
        }),
      ).rejects.toThrow();
    });

    it('accepts valid employment types', async () => {
      for (const empType of ['full_time', 'part_time', 'contract', 'intern']) {
        (service.createEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

        await (api.createEmployee as Function)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          hireDate: '2026-01-15',
          departmentId: UUID2,
          designationId: UUID3,
          employmentType: empType,
        });

        expect(service.createEmployee).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ employmentType: empType }),
        );
        vi.clearAllMocks();
        mockGetAuthData.mockReturnValue(createMockSession());
      }
    });

    it('propagates service errors', async () => {
      (service.createEmployee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Employee email already exists'),
      );

      await expect((api.createEmployee as Function)(validReq)).rejects.toThrow(
        'Employee email already exists',
      );
    });
  });

  describe('updateEmployee', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      const result = await (api.updateEmployee as Function)({ id: UUID, firstName: 'Jane' });

      expect(service.updateEmployee).toHaveBeenCalledWith(UUID, { firstName: 'Jane' });
      expect(result).toEqual(mockEmployee);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateEmployee as Function)({ id: UUID, firstName: 'Jane' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects firstName that is too long', async () => {
      await expect(
        (api.updateEmployee as Function)({ id: UUID, firstName: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('rejects lastName that is too long', async () => {
      await expect(
        (api.updateEmployee as Function)({ id: UUID, lastName: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('rejects invalid email format', async () => {
      await expect(
        (api.updateEmployee as Function)({ id: UUID, email: 'bad' }),
      ).rejects.toThrow();
    });

    it('allows setting phone to null', async () => {
      (service.updateEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      await (api.updateEmployee as Function)({ id: UUID, phone: null });

      expect(service.updateEmployee).toHaveBeenCalledWith(UUID, { phone: null });
    });

    it('allows setting managerId to null', async () => {
      (service.updateEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      await (api.updateEmployee as Function)({ id: UUID, managerId: null });

      expect(service.updateEmployee).toHaveBeenCalledWith(UUID, { managerId: null });
    });

    it('allows setting userId to null', async () => {
      (service.updateEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployee);

      await (api.updateEmployee as Function)({ id: UUID, userId: null });

      expect(service.updateEmployee).toHaveBeenCalledWith(UUID, { userId: null });
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateEmployee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Employee with id xyz not found'),
      );

      await expect(
        (api.updateEmployee as Function)({ id: 'xyz', firstName: 'Jane' }),
      ).rejects.toThrow('Employee with id xyz not found');
    });
  });

  describe('deleteEmployee', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteEmployee as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteEmployee as Function)({ id: UUID });

      expect(service.deleteEmployee).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteEmployee as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteEmployee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Employee with id xyz not found'),
      );

      await expect((api.deleteEmployee as Function)({ id: 'xyz' })).rejects.toThrow(
        'Employee with id xyz not found',
      );
    });

    it('propagates error when employee has active salary', async () => {
      (service.deleteEmployee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete employee with active salary'),
      );

      await expect((api.deleteEmployee as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete employee with active salary',
      );
    });
  });

  // ─── Attendance ──────────────────────────────────────────────────────────

  describe('getAttendance', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(mockAttendance);

      const result = await (api.getAttendance as Function)({ id: UUID });

      expect(service.getAttendance).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockAttendance);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getAttendance as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Attendance with id xyz not found'),
      );

      await expect((api.getAttendance as Function)({ id: 'xyz' })).rejects.toThrow(
        'Attendance with id xyz not found',
      );
    });
  });

  describe('listAttendance', () => {
    const listResult = { data: [mockAttendance], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listAttendance as Function)({});

      expect(service.listAttendance).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listAttendance as Function)({ page: 3, limit: 50 });

      expect(service.listAttendance).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 3,
        limit: 50,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listAttendance as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listAttendance as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listAttendance as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createAttendance', () => {
    const validReq = {
      employeeId: UUID2,
      date: '2026-01-15',
      status: 'present',
    };

    it('calls service with correct args when authenticated', async () => {
      (service.createAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(mockAttendance);

      const result = await (api.createAttendance as Function)(validReq);

      expect(service.createAttendance).toHaveBeenCalledWith(TEST_TENANT_ID, {
        employeeId: UUID2,
        date: '2026-01-15',
        clockIn: undefined,
        clockOut: undefined,
        status: 'present',
        hoursWorked: undefined,
        overtimeHours: undefined,
        notes: undefined,
      });
      expect(result).toEqual(mockAttendance);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createAttendance as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when employeeId is missing', async () => {
      await expect(
        (api.createAttendance as Function)({ date: '2026-01-15', status: 'present' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when date is missing', async () => {
      await expect(
        (api.createAttendance as Function)({ employeeId: UUID2, status: 'present' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when date format is invalid', async () => {
      await expect(
        (api.createAttendance as Function)({
          employeeId: UUID2,
          date: '15-01-2026',
          status: 'present',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when status is invalid', async () => {
      await expect(
        (api.createAttendance as Function)({
          employeeId: UUID2,
          date: '2026-01-15',
          status: 'invalid',
        }),
      ).rejects.toThrow();
    });

    it('accepts valid attendance statuses', async () => {
      for (const status of ['present', 'absent', 'half_day', 'work_from_home']) {
        (service.createAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(mockAttendance);

        await (api.createAttendance as Function)({
          employeeId: UUID2,
          date: '2026-01-15',
          status,
        });

        expect(service.createAttendance).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status }),
        );
        vi.clearAllMocks();
        mockGetAuthData.mockReturnValue(createMockSession());
      }
    });

    it('propagates service errors', async () => {
      (service.createAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Duplicate attendance record'),
      );

      await expect((api.createAttendance as Function)(validReq)).rejects.toThrow(
        'Duplicate attendance record',
      );
    });
  });

  describe('updateAttendance', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(mockAttendance);

      const result = await (api.updateAttendance as Function)({
        id: UUID,
        status: 'present',
      });

      expect(service.updateAttendance).toHaveBeenCalledWith(UUID, { status: 'present' });
      expect(result).toEqual(mockAttendance);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateAttendance as Function)({ id: UUID, status: 'present' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects invalid status value', async () => {
      await expect(
        (api.updateAttendance as Function)({ id: UUID, status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Attendance with id xyz not found'),
      );

      await expect(
        (api.updateAttendance as Function)({ id: 'xyz', status: 'present' }),
      ).rejects.toThrow('Attendance with id xyz not found');
    });

    it('propagates duplicate record error', async () => {
      (service.updateAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Duplicate attendance record for this employee on this date'),
      );

      await expect(
        (api.updateAttendance as Function)({ id: UUID, status: 'absent' }),
      ).rejects.toThrow('Duplicate attendance record for this employee on this date');
    });
  });

  describe('deleteAttendance', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteAttendance as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteAttendance as Function)({ id: UUID });

      expect(service.deleteAttendance).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteAttendance as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteAttendance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Attendance with id xyz not found'),
      );

      await expect((api.deleteAttendance as Function)({ id: 'xyz' })).rejects.toThrow(
        'Attendance with id xyz not found',
      );
    });
  });

  // ─── Leave Types ─────────────────────────────────────────────────────────

  describe('getLeaveType', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getLeaveType as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeaveType);

      const result = await (api.getLeaveType as Function)({ id: UUID });

      expect(service.getLeaveType).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockLeaveType);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getLeaveType as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getLeaveType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave type with id xyz not found'),
      );

      await expect((api.getLeaveType as Function)({ id: 'xyz' })).rejects.toThrow(
        'Leave type with id xyz not found',
      );
    });
  });

  describe('listLeaveTypes', () => {
    const listResult = { data: [mockLeaveType], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listLeaveTypes as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listLeaveTypes as Function)({});

      expect(service.listLeaveTypes).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listLeaveTypes as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listLeaveTypes as Function)({ page: 2, limit: 10 });

      expect(service.listLeaveTypes).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listLeaveTypes as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listLeaveTypes as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listLeaveTypes as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listLeaveTypes as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createLeaveType', () => {
    const validReq = { name: 'Annual Leave', code: 'AL' };

    it('calls service with correct args when authenticated', async () => {
      (service.createLeaveType as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeaveType);

      const result = await (api.createLeaveType as Function)(validReq);

      expect(service.createLeaveType).toHaveBeenCalledWith(TEST_TENANT_ID, {
        name: 'Annual Leave',
        code: 'AL',
        daysPerYear: undefined,
        isPaid: undefined,
        carryForward: undefined,
        isActive: undefined,
      });
      expect(result).toEqual(mockLeaveType);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createLeaveType as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when name is missing', async () => {
      await expect((api.createLeaveType as Function)({ code: 'AL' })).rejects.toThrow();
    });

    it('throws ValidationError when code is missing', async () => {
      await expect((api.createLeaveType as Function)({ name: 'Annual Leave' })).rejects.toThrow();
    });

    it('throws ValidationError when name exceeds 50 chars', async () => {
      await expect(
        (api.createLeaveType as Function)({ name: 'x'.repeat(51), code: 'AL' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when daysPerYear is negative', async () => {
      await expect(
        (api.createLeaveType as Function)({ name: 'AL', code: 'AL', daysPerYear: -1 }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createLeaveType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave type code already exists'),
      );

      await expect((api.createLeaveType as Function)(validReq)).rejects.toThrow(
        'Leave type code already exists',
      );
    });
  });

  describe('updateLeaveType', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateLeaveType as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeaveType);

      const result = await (api.updateLeaveType as Function)({ id: UUID, name: 'Updated' });

      expect(service.updateLeaveType).toHaveBeenCalledWith(UUID, { name: 'Updated' });
      expect(result).toEqual(mockLeaveType);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateLeaveType as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateLeaveType as Function)({ id: UUID, name: 'x'.repeat(51) }),
      ).rejects.toThrow();
    });

    it('rejects negative daysPerYear', async () => {
      await expect(
        (api.updateLeaveType as Function)({ id: UUID, daysPerYear: -5 }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateLeaveType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave type with id xyz not found'),
      );

      await expect(
        (api.updateLeaveType as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Leave type with id xyz not found');
    });
  });

  describe('deleteLeaveType', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteLeaveType as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteLeaveType as Function)({ id: UUID });

      expect(service.deleteLeaveType).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteLeaveType as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteLeaveType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave type with id xyz not found'),
      );

      await expect((api.deleteLeaveType as Function)({ id: 'xyz' })).rejects.toThrow(
        'Leave type with id xyz not found',
      );
    });

    it('propagates error when leave type has requests', async () => {
      (service.deleteLeaveType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete leave type with existing requests'),
      );

      await expect((api.deleteLeaveType as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete leave type with existing requests',
      );
    });
  });

  // ─── Leave Requests ──────────────────────────────────────────────────────

  describe('getLeaveRequest', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getLeaveRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeaveRequest);

      const result = await (api.getLeaveRequest as Function)({ id: UUID });

      expect(service.getLeaveRequest).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockLeaveRequest);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getLeaveRequest as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getLeaveRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave request with id xyz not found'),
      );

      await expect((api.getLeaveRequest as Function)({ id: 'xyz' })).rejects.toThrow(
        'Leave request with id xyz not found',
      );
    });
  });

  describe('listLeaveRequests', () => {
    const listResult = { data: [mockLeaveRequest], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listLeaveRequests as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listLeaveRequests as Function)({});

      expect(service.listLeaveRequests).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listLeaveRequests as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listLeaveRequests as Function)({ page: 2, limit: 5 });

      expect(service.listLeaveRequests).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 5,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listLeaveRequests as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects non-integer limit', async () => {
      await expect((api.listLeaveRequests as Function)({ limit: 1.5 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listLeaveRequests as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listLeaveRequests as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createLeaveRequest', () => {
    const validReq = {
      employeeId: UUID2,
      leaveTypeId: UUID3,
      startDate: '2026-02-01',
      endDate: '2026-02-05',
      totalDays: 5,
    };

    it('calls service with correct args when authenticated', async () => {
      (service.createLeaveRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeaveRequest);

      const result = await (api.createLeaveRequest as Function)(validReq);

      expect(service.createLeaveRequest).toHaveBeenCalledWith(TEST_TENANT_ID, {
        employeeId: UUID2,
        leaveTypeId: UUID3,
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        totalDays: 5,
        reason: undefined,
      });
      expect(result).toEqual(mockLeaveRequest);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createLeaveRequest as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when employeeId is missing', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          leaveTypeId: UUID3,
          startDate: '2026-02-01',
          endDate: '2026-02-05',
          totalDays: 5,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when leaveTypeId is missing', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          employeeId: UUID2,
          startDate: '2026-02-01',
          endDate: '2026-02-05',
          totalDays: 5,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when startDate format is invalid', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          employeeId: UUID2,
          leaveTypeId: UUID3,
          startDate: '01-02-2026',
          endDate: '2026-02-05',
          totalDays: 5,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when endDate format is invalid', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          employeeId: UUID2,
          leaveTypeId: UUID3,
          startDate: '2026-02-01',
          endDate: '05-02-2026',
          totalDays: 5,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when totalDays is zero', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          employeeId: UUID2,
          leaveTypeId: UUID3,
          startDate: '2026-02-01',
          endDate: '2026-02-05',
          totalDays: 0,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when totalDays is negative', async () => {
      await expect(
        (api.createLeaveRequest as Function)({
          employeeId: UUID2,
          leaveTypeId: UUID3,
          startDate: '2026-02-01',
          endDate: '2026-02-05',
          totalDays: -1,
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createLeaveRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Invalid leave date range'),
      );

      await expect((api.createLeaveRequest as Function)(validReq)).rejects.toThrow(
        'Invalid leave date range',
      );
    });
  });

  describe('approveRejectLeaveRequest', () => {
    it('calls service with correct args for approval', async () => {
      const approvedRequest = { ...mockLeaveRequest, status: 'approved' };
      (service.approveRejectLeaveRequest as ReturnType<typeof vi.fn>).mockResolvedValue(
        approvedRequest,
      );

      const result = await (api.approveRejectLeaveRequest as Function)({
        id: UUID,
        status: 'approved',
      });

      expect(service.approveRejectLeaveRequest).toHaveBeenCalledWith(UUID, TEST_USER_ID, {
        status: 'approved',
        rejectionReason: undefined,
      });
      expect(result).toEqual(approvedRequest);
    });

    it('calls service with correct args for rejection', async () => {
      const rejectedRequest = { ...mockLeaveRequest, status: 'rejected' };
      (service.approveRejectLeaveRequest as ReturnType<typeof vi.fn>).mockResolvedValue(
        rejectedRequest,
      );

      const result = await (api.approveRejectLeaveRequest as Function)({
        id: UUID,
        status: 'rejected',
        rejectionReason: 'Insufficient balance',
      });

      expect(service.approveRejectLeaveRequest).toHaveBeenCalledWith(UUID, TEST_USER_ID, {
        status: 'rejected',
        rejectionReason: 'Insufficient balance',
      });
      expect(result).toEqual(rejectedRequest);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.approveRejectLeaveRequest as Function)({ id: UUID, status: 'approved' }),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when status is invalid', async () => {
      await expect(
        (api.approveRejectLeaveRequest as Function)({ id: UUID, status: 'pending' }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.approveRejectLeaveRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave request with id xyz not found'),
      );

      await expect(
        (api.approveRejectLeaveRequest as Function)({ id: 'xyz', status: 'approved' }),
      ).rejects.toThrow('Leave request with id xyz not found');
    });

    it('propagates error when already processed', async () => {
      (service.approveRejectLeaveRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Leave request already processed'),
      );

      await expect(
        (api.approveRejectLeaveRequest as Function)({ id: UUID, status: 'approved' }),
      ).rejects.toThrow('Leave request already processed');
    });

    it('propagates unauthorized approval error', async () => {
      (service.approveRejectLeaveRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Not authorized for leave approval'),
      );

      await expect(
        (api.approveRejectLeaveRequest as Function)({ id: UUID, status: 'approved' }),
      ).rejects.toThrow('Not authorized for leave approval');
    });
  });

  // ─── Salaries ────────────────────────────────────────────────────────────

  describe('getSalary', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getSalary as ReturnType<typeof vi.fn>).mockResolvedValue(mockSalary);

      const result = await (api.getSalary as Function)({ id: UUID });

      expect(service.getSalary).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockSalary);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getSalary as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getSalary as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Salary with id xyz not found'),
      );

      await expect((api.getSalary as Function)({ id: 'xyz' })).rejects.toThrow(
        'Salary with id xyz not found',
      );
    });
  });

  describe('listSalaries', () => {
    const listResult = { data: [mockSalary], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listSalaries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listSalaries as Function)({});

      expect(service.listSalaries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listSalaries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listSalaries as Function)({ page: 2, limit: 10 });

      expect(service.listSalaries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listSalaries as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects page zero', async () => {
      await expect((api.listSalaries as Function)({ page: 0 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listSalaries as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listSalaries as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createSalary', () => {
    const validReq = {
      employeeId: UUID2,
      basicSalary: '75000',
      effectiveDate: '2026-01-01',
    };

    it('calls service with correct args when authenticated', async () => {
      (service.createSalary as ReturnType<typeof vi.fn>).mockResolvedValue(mockSalary);

      const result = await (api.createSalary as Function)(validReq);

      expect(service.createSalary).toHaveBeenCalledWith(TEST_TENANT_ID, {
        employeeId: UUID2,
        basicSalary: '75000',
        currency: undefined,
        payFrequency: undefined,
        effectiveDate: '2026-01-01',
        isActive: undefined,
      });
      expect(result).toEqual(mockSalary);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createSalary as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when employeeId is missing', async () => {
      await expect(
        (api.createSalary as Function)({ basicSalary: '75000', effectiveDate: '2026-01-01' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when basicSalary is missing', async () => {
      await expect(
        (api.createSalary as Function)({ employeeId: UUID2, effectiveDate: '2026-01-01' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when basicSalary is empty string', async () => {
      await expect(
        (api.createSalary as Function)({ employeeId: UUID2, basicSalary: '', effectiveDate: '2026-01-01' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when effectiveDate format is invalid', async () => {
      await expect(
        (api.createSalary as Function)({
          employeeId: UUID2,
          basicSalary: '75000',
          effectiveDate: '01-01-2026',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when currency length is not 3', async () => {
      await expect(
        (api.createSalary as Function)({
          employeeId: UUID2,
          basicSalary: '75000',
          effectiveDate: '2026-01-01',
          currency: 'US',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when payFrequency is invalid', async () => {
      await expect(
        (api.createSalary as Function)({
          employeeId: UUID2,
          basicSalary: '75000',
          effectiveDate: '2026-01-01',
          payFrequency: 'yearly',
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createSalary as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Employee already has an active salary'),
      );

      await expect((api.createSalary as Function)(validReq)).rejects.toThrow(
        'Employee already has an active salary',
      );
    });
  });

  describe('updateSalary', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateSalary as ReturnType<typeof vi.fn>).mockResolvedValue(mockSalary);

      const result = await (api.updateSalary as Function)({ id: UUID, basicSalary: '80000' });

      expect(service.updateSalary).toHaveBeenCalledWith(UUID, { basicSalary: '80000' });
      expect(result).toEqual(mockSalary);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateSalary as Function)({ id: UUID, basicSalary: '80000' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects empty basicSalary', async () => {
      await expect(
        (api.updateSalary as Function)({ id: UUID, basicSalary: '' }),
      ).rejects.toThrow();
    });

    it('rejects invalid currency length', async () => {
      await expect(
        (api.updateSalary as Function)({ id: UUID, currency: 'US' }),
      ).rejects.toThrow();
    });

    it('rejects invalid payFrequency', async () => {
      await expect(
        (api.updateSalary as Function)({ id: UUID, payFrequency: 'yearly' }),
      ).rejects.toThrow();
    });

    it('rejects invalid effectiveDate format', async () => {
      await expect(
        (api.updateSalary as Function)({ id: UUID, effectiveDate: '01/01/2026' }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateSalary as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Salary with id xyz not found'),
      );

      await expect(
        (api.updateSalary as Function)({ id: 'xyz', basicSalary: '80000' }),
      ).rejects.toThrow('Salary with id xyz not found');
    });
  });

  describe('deleteSalary', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteSalary as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteSalary as Function)({ id: UUID });

      expect(service.deleteSalary).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteSalary as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteSalary as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Salary with id xyz not found'),
      );

      await expect((api.deleteSalary as Function)({ id: 'xyz' })).rejects.toThrow(
        'Salary with id xyz not found',
      );
    });
  });

  // ─── Payroll ─────────────────────────────────────────────────────────────

  describe('getPayroll', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getPayroll as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayroll);

      const result = await (api.getPayroll as Function)({ id: UUID });

      expect(service.getPayroll).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockPayroll);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getPayroll as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getPayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll with id xyz not found'),
      );

      await expect((api.getPayroll as Function)({ id: 'xyz' })).rejects.toThrow(
        'Payroll with id xyz not found',
      );
    });
  });

  describe('listPayroll', () => {
    const listResult = { data: [mockPayroll], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listPayroll as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listPayroll as Function)({});

      expect(service.listPayroll).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listPayroll as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listPayroll as Function)({ page: 2, limit: 10 });

      expect(service.listPayroll).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listPayroll as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listPayroll as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listPayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listPayroll as Function)({})).rejects.toThrow('Database error');
    });
  });

  describe('createPayroll', () => {
    const validReq = {
      employeeId: UUID2,
      payPeriodStart: '2026-01-01',
      payPeriodEnd: '2026-01-31',
      basicSalary: '75000',
    };

    it('calls service with correct args when authenticated', async () => {
      (service.createPayroll as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayroll);

      const result = await (api.createPayroll as Function)(validReq);

      expect(service.createPayroll).toHaveBeenCalledWith(TEST_TENANT_ID, {
        employeeId: UUID2,
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        basicSalary: '75000',
        allowances: undefined,
        deductions: undefined,
      });
      expect(result).toEqual(mockPayroll);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.createPayroll as Function)(validReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('throws ValidationError when employeeId is missing', async () => {
      await expect(
        (api.createPayroll as Function)({
          payPeriodStart: '2026-01-01',
          payPeriodEnd: '2026-01-31',
          basicSalary: '75000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when payPeriodStart is missing', async () => {
      await expect(
        (api.createPayroll as Function)({
          employeeId: UUID2,
          payPeriodEnd: '2026-01-31',
          basicSalary: '75000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when payPeriodEnd is missing', async () => {
      await expect(
        (api.createPayroll as Function)({
          employeeId: UUID2,
          payPeriodStart: '2026-01-01',
          basicSalary: '75000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when basicSalary is missing', async () => {
      await expect(
        (api.createPayroll as Function)({
          employeeId: UUID2,
          payPeriodStart: '2026-01-01',
          payPeriodEnd: '2026-01-31',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when payPeriodStart format is invalid', async () => {
      await expect(
        (api.createPayroll as Function)({
          employeeId: UUID2,
          payPeriodStart: '01-01-2026',
          payPeriodEnd: '2026-01-31',
          basicSalary: '75000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when payPeriodEnd format is invalid', async () => {
      await expect(
        (api.createPayroll as Function)({
          employeeId: UUID2,
          payPeriodStart: '2026-01-01',
          payPeriodEnd: '31-01-2026',
          basicSalary: '75000',
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createPayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Invalid pay period'),
      );

      await expect((api.createPayroll as Function)(validReq)).rejects.toThrow(
        'Invalid pay period',
      );
    });
  });

  describe('updatePayroll', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updatePayroll as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayroll);

      const result = await (api.updatePayroll as Function)({
        id: UUID,
        basicSalary: '80000',
      });

      expect(service.updatePayroll).toHaveBeenCalledWith(UUID, { basicSalary: '80000' });
      expect(result).toEqual(mockPayroll);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updatePayroll as Function)({ id: UUID, basicSalary: '80000' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects empty basicSalary', async () => {
      await expect(
        (api.updatePayroll as Function)({ id: UUID, basicSalary: '' }),
      ).rejects.toThrow();
    });

    it('rejects invalid status value', async () => {
      await expect(
        (api.updatePayroll as Function)({ id: UUID, status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('accepts valid status values', async () => {
      for (const status of ['draft', 'processed', 'paid']) {
        (service.updatePayroll as ReturnType<typeof vi.fn>).mockResolvedValue({
          ...mockPayroll,
          status,
        });

        const result = await (api.updatePayroll as Function)({ id: UUID, status });

        expect(service.updatePayroll).toHaveBeenCalledWith(UUID, { status });
        vi.clearAllMocks();
        mockGetAuthData.mockReturnValue(createMockSession());
      }
    });

    it('propagates NotFoundError from service', async () => {
      (service.updatePayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll with id xyz not found'),
      );

      await expect(
        (api.updatePayroll as Function)({ id: 'xyz', basicSalary: '80000' }),
      ).rejects.toThrow('Payroll with id xyz not found');
    });

    it('propagates already processed error', async () => {
      (service.updatePayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll already processed'),
      );

      await expect(
        (api.updatePayroll as Function)({ id: UUID, basicSalary: '80000' }),
      ).rejects.toThrow('Payroll already processed');
    });
  });

  describe('processPayroll', () => {
    it('calls service with correct args when authenticated', async () => {
      const processedPayroll = { ...mockPayroll, status: 'processed' };
      (service.processPayroll as ReturnType<typeof vi.fn>).mockResolvedValue(processedPayroll);

      const result = await (api.processPayroll as Function)({ id: UUID });

      expect(service.processPayroll).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(processedPayroll);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.processPayroll as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.processPayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll with id xyz not found'),
      );

      await expect((api.processPayroll as Function)({ id: 'xyz' })).rejects.toThrow(
        'Payroll with id xyz not found',
      );
    });

    it('propagates already processed error', async () => {
      (service.processPayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll already processed'),
      );

      await expect((api.processPayroll as Function)({ id: UUID })).rejects.toThrow(
        'Payroll already processed',
      );
    });
  });

  describe('deletePayroll', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deletePayroll as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deletePayroll as Function)({ id: UUID });

      expect(service.deletePayroll).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deletePayroll as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deletePayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payroll with id xyz not found'),
      );

      await expect((api.deletePayroll as Function)({ id: 'xyz' })).rejects.toThrow(
        'Payroll with id xyz not found',
      );
    });

    it('propagates error when payroll is processed', async () => {
      (service.deletePayroll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete processed payroll'),
      );

      await expect((api.deletePayroll as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete processed payroll',
      );
    });
  });

  // ─── Payslips ────────────────────────────────────────────────────────────

  describe('getPayslip', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getPayslip as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayslip);

      const result = await (api.getPayslip as Function)({ id: UUID });

      expect(service.getPayslip).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockPayslip);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getPayslip as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getPayslip as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payslip with id xyz not found'),
      );

      await expect((api.getPayslip as Function)({ id: 'xyz' })).rejects.toThrow(
        'Payslip with id xyz not found',
      );
    });
  });

  describe('listPayslips', () => {
    const listResult = { data: [mockPayslip], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listPayslips as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listPayslips as Function)({});

      expect(service.listPayslips).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listPayslips as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listPayslips as Function)({ page: 2, limit: 10 });

      expect(service.listPayslips).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listPayslips as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listPayslips as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('rejects negative page', async () => {
      await expect((api.listPayslips as Function)({ page: -1 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listPayslips as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listPayslips as Function)({})).rejects.toThrow('Database error');
    });
  });
});
