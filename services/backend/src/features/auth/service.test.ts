import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createAuditLogFixture,
  createPermissionFixture,
  createRoleFixture,
  createSessionFixture,
  createSuspendedUserFixture,
  createSystemRoleFixture,
  createUserFixture,
  createUserRoleFixture,
} from './fixtures/auth.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

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

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'user-00000000-0000-0000-000000000001' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {
    users: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    roles: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    userRoles: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    permissions: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    sessions: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
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
  users: createMockTable('users'),
  roles: createMockTable('roles'),
  userRoles: createMockTable('user_roles'),
  permissions: createMockTable('permissions'),
  sessions: createMockTable('sessions'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const { mockUsersRepo, mockRolesRepo, mockUserRolesRepo, mockPermissionsRepo, mockSessionsRepo } =
  vi.hoisted(() => ({
    mockUsersRepo: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      countByTenantId: vi.fn(),
    },
    mockRolesRepo: {
      findById: vi.fn(),
      findByName: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    },
    mockUserRolesRepo: {
      findByUserAndRole: vi.fn(),
      findByUserId: vi.fn(),
      findByRoleId: vi.fn(),
      assign: vi.fn(),
      remove: vi.fn(),
      removeAllForUser: vi.fn(),
    },
    mockPermissionsRepo: {
      findById: vi.fn(),
      findByRoleId: vi.fn(),
      findByRoleAndResource: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteByRoleId: vi.fn(),
    },
    mockSessionsRepo: {
      findById: vi.fn(),
      findByToken: vi.fn(),
      findManyByUserId: vi.fn(),
      findMany: vi.fn(),
      softDelete: vi.fn(),
      deleteAllForUser: vi.fn(),
    },
  }));

vi.mock('./repo', () => ({
  usersRepo: mockUsersRepo,
  rolesRepo: mockRolesRepo,
  userRolesRepo: mockUserRolesRepo,
  permissionsRepo: mockPermissionsRepo,
  sessionsRepo: mockSessionsRepo,
}));

// ─── Mock Audit Client ──────────────────────────────────────────────────────

const { mockAuditLog } = vi.hoisted(() => ({
  mockAuditLog: vi.fn(),
}));

vi.mock('../audit/client', () => ({
  auditLog: mockAuditLog,
}));

// ─── Mock Audit Service (for listLogEntries dynamic import) ─────────────────

const { mockListLogEntries } = vi.hoisted(() => ({
  mockListLogEntries: vi.fn(),
}));

vi.mock('../audit/service', () => ({
  listLogEntries: mockListLogEntries,
}));

// ─── Import Errors and Service After Mocking ──────────────────────────────

import {
  CannotDeactivateSelfError,
  CannotDeleteSystemRoleError,
  CannotModifySystemRoleError,
  DuplicateEmailError,
  DuplicatePermissionError,
  DuplicateRoleNameError,
  DuplicateUsernameError,
  PermissionNotFoundError,
  RoleNotFoundError,
  SessionNotFoundError,
  UserAlreadySuspendedError,
  UserNotActiveError,
  UserNotFoundError,
  UserRoleAlreadyExistsError,
  UserRoleNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // USER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('User Service', () => {
    describe('createUser', () => {
      it('should create user with valid data', async () => {
        const user = createUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.findByUsername.mockResolvedValue(undefined);
        mockUsersRepo.create.mockResolvedValue(user);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createUser(
          { email: user.email, name: user.name, username: user.username },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(user);
        expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith(user.email, TEST_TENANT_ID);
        expect(mockUsersRepo.findByUsername).toHaveBeenCalledWith(user.username, TEST_TENANT_ID);
        expect(mockUsersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: user.email,
            name: user.name,
            username: user.username,
            status: 'active',
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should create user with explicit status', async () => {
        const user = createSuspendedUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.findByUsername.mockResolvedValue(undefined);
        mockUsersRepo.create.mockResolvedValue(user);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createUser(
          { email: user.email, name: user.name, username: user.username, status: 'suspended' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.status).toBe('suspended');
        expect(mockUsersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'suspended' }),
        );
      });

      it('should create audit log entry', async () => {
        const user = createUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.findByUsername.mockResolvedValue(undefined);
        mockUsersRepo.create.mockResolvedValue(user);
        mockAuditLog.mockResolvedValue(undefined);

        await service.createUser(
          { email: user.email, name: user.name, username: user.username },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'create',
            resource: 'user',
            resourceId: user.id,
          }),
        );
      });

      it('should reject duplicate email', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(existing);

        await expect(
          service.createUser(
            { email: existing.email, name: 'Test', username: 'different' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(DuplicateEmailError);
      });

      it('should reject duplicate username', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.findByUsername.mockResolvedValue(existing);

        await expect(
          service.createUser(
            { email: 'different@example.com', name: 'Test', username: existing.username },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(DuplicateUsernameError);
      });

      it('should scope email uniqueness to tenant', async () => {
        const user = createUserFixture();

        mockUsersRepo.findByEmail.mockImplementation(async (_email: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return createUserFixture();
          return undefined;
        });
        mockUsersRepo.findByUsername.mockResolvedValue(undefined);
        mockUsersRepo.create.mockResolvedValue(user);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createUser(
          { email: user.email, name: user.name, username: user.username },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toBeDefined();
        expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith(user.email, TEST_TENANT_ID);
      });

      it('should scope username uniqueness to tenant', async () => {
        const user = createUserFixture();

        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.findByUsername.mockImplementation(
          async (_username: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createUserFixture();
            return undefined;
          },
        );
        mockUsersRepo.create.mockResolvedValue(user);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createUser(
          { email: user.email, name: user.name, username: user.username },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toBeDefined();
        expect(mockUsersRepo.findByUsername).toHaveBeenCalledWith(user.username, TEST_TENANT_ID);
      });
    });

    describe('getUser', () => {
      it('should return user by id', async () => {
        const user = createUserFixture();
        mockUsersRepo.findById.mockResolvedValue(user);

        const result = await service.getUser(user.id, TEST_TENANT_ID);

        expect(result).toEqual(user);
        expect(mockUsersRepo.findById).toHaveBeenCalledWith(user.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getUser('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          UserNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getUser('user-1', OTHER_TENANT_ID)).rejects.toThrow(UserNotFoundError);
        expect(mockUsersRepo.findById).toHaveBeenCalledWith('user-1', OTHER_TENANT_ID);
      });
    });

    describe('listUsers', () => {
      it('should return paginated users', async () => {
        const users = [createUserFixture()];
        mockUsersRepo.findMany.mockResolvedValue({ data: users, total: 1 });

        const result = await service.listUsers(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no users exist', async () => {
        mockUsersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listUsers(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockUsersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listUsers(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockUsersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter users by status', async () => {
        mockUsersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listUsers(TEST_TENANT_ID, { page: 1, limit: 20, status: 'active' });

        expect(mockUsersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'active' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockUsersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listUsers(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockUsersRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('updateUser', () => {
      it('should update user name', async () => {
        const existing = createUserFixture();
        const updated = { ...existing, name: 'Jane Doe' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { name: 'Jane Doe' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.name).toBe('Jane Doe');
        expect(mockUsersRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Jane Doe',
        });
      });

      it('should update user email', async () => {
        const existing = createUserFixture();
        const updated = { ...existing, email: 'new@example.com' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByEmail.mockResolvedValue(undefined);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { email: 'new@example.com' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.email).toBe('new@example.com');
      });

      it('should update user username', async () => {
        const existing = createUserFixture();
        const updated = { ...existing, username: 'janedoe' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByUsername.mockResolvedValue(undefined);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { username: 'janedoe' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.username).toBe('janedoe');
      });

      it('should update user status to suspended', async () => {
        const existing = createUserFixture();
        const updated = { ...existing, status: 'suspended' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { status: 'suspended' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.status).toBe('suspended');
      });

      it('should create audit log entry', async () => {
        const existing = createUserFixture();
        const updated = { ...existing, name: 'Updated' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        await service.updateUser(existing.id, { name: 'Updated' }, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'update',
            resource: 'user',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateUser('non-existent', { name: 'Test' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotFoundError);
      });

      it('should reject duplicate email on update', async () => {
        const existing = createUserFixture({ email: 'old@example.com' });
        const duplicate = createUserFixture({ id: 'other-id', email: 'new@example.com' });

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByEmail.mockResolvedValue(duplicate);

        await expect(
          service.updateUser(
            existing.id,
            { email: 'new@example.com' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(DuplicateEmailError);
      });

      it('should reject duplicate username on update', async () => {
        const existing = createUserFixture({ username: 'olduser' });
        const duplicate = createUserFixture({ id: 'other-id', username: 'newuser' });

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByUsername.mockResolvedValue(duplicate);

        await expect(
          service.updateUser(existing.id, { username: 'newuser' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(DuplicateUsernameError);
      });

      it('should allow updating email to same value', async () => {
        const existing = createUserFixture({ email: 'same@example.com' });
        const updated = { ...existing };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { email: 'same@example.com' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.email).toBe('same@example.com');
        expect(mockUsersRepo.findByEmail).not.toHaveBeenCalled();
      });

      it('should allow updating username to same value', async () => {
        const existing = createUserFixture({ username: 'sameuser' });
        const updated = { ...existing };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { username: 'sameuser' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.username).toBe('sameuser');
        expect(mockUsersRepo.findByUsername).not.toHaveBeenCalled();
      });

      it('should prevent user from deactivating themselves', async () => {
        const existing = createUserFixture({ id: TEST_USER_ID });

        mockUsersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateUser(TEST_USER_ID, { status: 'suspended' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(CannotDeactivateSelfError);
      });

      it('should reject suspend when user is already suspended', async () => {
        const existing = createSuspendedUserFixture();

        mockUsersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateUser(existing.id, { status: 'suspended' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserAlreadySuspendedError);
      });

      it('should allow reactivating a suspended user', async () => {
        const existing = createSuspendedUserFixture();
        const updated = { ...existing, status: 'active' };

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { status: 'active' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.status).toBe('active');
      });

      it('should scope email uniqueness check to tenant', async () => {
        const existing = createUserFixture({ email: 'old@example.com' });

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByEmail.mockImplementation(async (_email: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return createUserFixture();
          return undefined;
        });
        mockUsersRepo.update.mockResolvedValue({ ...existing, email: 'new@example.com' });
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { email: 'new@example.com' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.email).toBe('new@example.com');
      });

      it('should scope username uniqueness check to tenant', async () => {
        const existing = createUserFixture({ username: 'olduser' });

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.findByUsername.mockImplementation(
          async (_username: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createUserFixture();
            return undefined;
          },
        );
        mockUsersRepo.update.mockResolvedValue({ ...existing, username: 'newuser' });
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateUser(
          existing.id,
          { username: 'newuser' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.username).toBe('newuser');
      });
    });

    describe('deleteUser', () => {
      it('should soft delete user', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.softDelete.mockResolvedValue(undefined);
        mockUserRolesRepo.removeAllForUser.mockResolvedValue(undefined);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteUser(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockUsersRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should remove all role assignments on delete', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.softDelete.mockResolvedValue(undefined);
        mockUserRolesRepo.removeAllForUser.mockResolvedValue(undefined);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteUser(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockUserRolesRepo.removeAllForUser).toHaveBeenCalledWith(existing.id);
      });

      it('should invalidate all sessions on delete', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.softDelete.mockResolvedValue(undefined);
        mockUserRolesRepo.removeAllForUser.mockResolvedValue(undefined);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteUser(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockSessionsRepo.deleteAllForUser).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should create audit log entry', async () => {
        const existing = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(existing);
        mockUsersRepo.softDelete.mockResolvedValue(undefined);
        mockUserRolesRepo.removeAllForUser.mockResolvedValue(undefined);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteUser(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'delete',
            resource: 'user',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteUser('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotFoundError);
      });

      it('should prevent user from deleting themselves', async () => {
        const existing = createUserFixture({ id: TEST_USER_ID });

        mockUsersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.deleteUser(TEST_USER_ID, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(CannotDeactivateSelfError);
      });

      it('should scope deletion to tenant', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteUser('user-1', OTHER_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          UserNotFoundError,
        );
        expect(mockUsersRepo.findById).toHaveBeenCalledWith('user-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Role Service', () => {
    describe('createRole', () => {
      it('should create role with valid data', async () => {
        const role = createRoleFixture();

        mockRolesRepo.findByName.mockResolvedValue(undefined);
        mockRolesRepo.create.mockResolvedValue(role);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createRole(
          { name: role.name, description: role.description },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(role);
        expect(mockRolesRepo.findByName).toHaveBeenCalledWith(role.name, TEST_TENANT_ID);
        expect(mockRolesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: role.name,
            description: role.description,
            isSystem: false,
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should create system role when isSystem is true', async () => {
        const role = createSystemRoleFixture();

        mockRolesRepo.findByName.mockResolvedValue(undefined);
        mockRolesRepo.create.mockResolvedValue(role);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createRole(
          { name: role.name, isSystem: true },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.isSystem).toBe(true);
        expect(mockRolesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ isSystem: true }),
        );
      });

      it('should create audit log entry', async () => {
        const role = createRoleFixture();

        mockRolesRepo.findByName.mockResolvedValue(undefined);
        mockRolesRepo.create.mockResolvedValue(role);
        mockAuditLog.mockResolvedValue(undefined);

        await service.createRole({ name: role.name }, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'create',
            resource: 'role',
            resourceId: role.id,
          }),
        );
      });

      it('should reject duplicate role name', async () => {
        const existing = createRoleFixture();

        mockRolesRepo.findByName.mockResolvedValue(existing);

        await expect(
          service.createRole({ name: existing.name }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(DuplicateRoleNameError);
      });

      it('should scope name uniqueness to tenant', async () => {
        const role = createRoleFixture();

        mockRolesRepo.findByName.mockImplementation(async (_name: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return createRoleFixture();
          return undefined;
        });
        mockRolesRepo.create.mockResolvedValue(role);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createRole({ name: role.name }, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toBeDefined();
        expect(mockRolesRepo.findByName).toHaveBeenCalledWith(role.name, TEST_TENANT_ID);
      });
    });

    describe('getRole', () => {
      it('should return role by id', async () => {
        const role = createRoleFixture();
        mockRolesRepo.findById.mockResolvedValue(role);

        const result = await service.getRole(role.id, TEST_TENANT_ID);

        expect(result).toEqual(role);
        expect(mockRolesRepo.findById).toHaveBeenCalledWith(role.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent role', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getRole('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          RoleNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getRole('role-1', OTHER_TENANT_ID)).rejects.toThrow(RoleNotFoundError);
        expect(mockRolesRepo.findById).toHaveBeenCalledWith('role-1', OTHER_TENANT_ID);
      });
    });

    describe('listRoles', () => {
      it('should return paginated roles', async () => {
        const roles = [createRoleFixture()];
        mockRolesRepo.findMany.mockResolvedValue({ data: roles, total: 1 });

        const result = await service.listRoles(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no roles exist', async () => {
        mockRolesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listRoles(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockRolesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listRoles(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockRolesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockRolesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listRoles(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockRolesRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('updateRole', () => {
      it('should update role name', async () => {
        const existing = createRoleFixture();
        const updated = { ...existing, name: 'Super Admin' };

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateRole(
          existing.id,
          { name: 'Super Admin' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.name).toBe('Super Admin');
        expect(mockRolesRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Super Admin',
        });
      });

      it('should update role description', async () => {
        const existing = createRoleFixture();
        const updated = { ...existing, description: 'Updated description' };

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateRole(
          existing.id,
          { description: 'Updated description' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.description).toBe('Updated description');
      });

      it('should create audit log entry', async () => {
        const existing = createRoleFixture();
        const updated = { ...existing, name: 'Updated' };

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        await service.updateRole(existing.id, { name: 'Updated' }, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'update',
            resource: 'role',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent role', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateRole('non-existent', { name: 'Test' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(RoleNotFoundError);
      });

      it('should reject modifying system role', async () => {
        const existing = createSystemRoleFixture();
        mockRolesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateRole(existing.id, { name: 'Changed' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(CannotModifySystemRoleError);
      });

      it('should reject duplicate role name on update', async () => {
        const existing = createRoleFixture({ name: 'Old Name' });
        const duplicate = createRoleFixture({ id: 'other-id', name: 'New Name' });

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.findByName.mockResolvedValue(duplicate);

        await expect(
          service.updateRole(existing.id, { name: 'New Name' }, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(DuplicateRoleNameError);
      });

      it('should allow updating name to same value', async () => {
        const existing = createRoleFixture({ name: 'Same Name' });
        const updated = { ...existing };

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.update.mockResolvedValue(updated);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateRole(
          existing.id,
          { name: 'Same Name' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.name).toBe('Same Name');
        expect(mockRolesRepo.findByName).not.toHaveBeenCalled();
      });

      it('should scope name uniqueness check to tenant', async () => {
        const existing = createRoleFixture({ name: 'Old Name' });

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockRolesRepo.findByName.mockImplementation(async (_name: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return createRoleFixture();
          return undefined;
        });
        mockRolesRepo.update.mockResolvedValue({ ...existing, name: 'New Name' });
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.updateRole(
          existing.id,
          { name: 'New Name' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.name).toBe('New Name');
      });
    });

    describe('deleteRole', () => {
      it('should soft delete non-system role', async () => {
        const existing = createRoleFixture();
        const assignments = [createUserRoleFixture()];

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockUserRolesRepo.findByRoleId.mockResolvedValue(assignments);
        mockUserRolesRepo.remove.mockResolvedValue(undefined);
        mockPermissionsRepo.deleteByRoleId.mockResolvedValue(undefined);
        mockRolesRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteRole(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockRolesRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should remove all user-role assignments', async () => {
        const existing = createRoleFixture();
        const assignments = [
          createUserRoleFixture({ userId: 'user-1', roleId: existing.id }),
          createUserRoleFixture({ id: 'ur-2', userId: 'user-2', roleId: existing.id }),
        ];

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockUserRolesRepo.findByRoleId.mockResolvedValue(assignments);
        mockUserRolesRepo.remove.mockResolvedValue(undefined);
        mockPermissionsRepo.deleteByRoleId.mockResolvedValue(undefined);
        mockRolesRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteRole(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockUserRolesRepo.remove).toHaveBeenCalledTimes(2);
        expect(mockUserRolesRepo.remove).toHaveBeenCalledWith('user-1', existing.id);
        expect(mockUserRolesRepo.remove).toHaveBeenCalledWith('user-2', existing.id);
      });

      it('should remove all permissions for the role', async () => {
        const existing = createRoleFixture();

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockUserRolesRepo.findByRoleId.mockResolvedValue([]);
        mockPermissionsRepo.deleteByRoleId.mockResolvedValue(undefined);
        mockRolesRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteRole(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockPermissionsRepo.deleteByRoleId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
      });

      it('should create audit log entry', async () => {
        const existing = createRoleFixture();

        mockRolesRepo.findById.mockResolvedValue(existing);
        mockUserRolesRepo.findByRoleId.mockResolvedValue([]);
        mockPermissionsRepo.deleteByRoleId.mockResolvedValue(undefined);
        mockRolesRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deleteRole(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'delete',
            resource: 'role',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent role', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteRole('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(RoleNotFoundError);
      });

      it('should reject deleting system role', async () => {
        const existing = createSystemRoleFixture();
        mockRolesRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteRole(existing.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          CannotDeleteSystemRoleError,
        );
      });

      it('should scope deletion to tenant', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteRole('role-1', OTHER_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          RoleNotFoundError,
        );
        expect(mockRolesRepo.findById).toHaveBeenCalledWith('role-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // USER ROLE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('User Role Service', () => {
    describe('assignRole', () => {
      it('should assign role to active user', async () => {
        const user = createUserFixture();
        const role = createRoleFixture();
        const assignment = createUserRoleFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockRolesRepo.findById.mockResolvedValue(role);
        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(undefined);
        mockUserRolesRepo.assign.mockResolvedValue(assignment);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.assignRole(user.id, role.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(assignment);
        expect(mockUserRolesRepo.assign).toHaveBeenCalledWith({
          userId: user.id,
          roleId: role.id,
        });
      });

      it('should create audit log entry', async () => {
        const user = createUserFixture();
        const role = createRoleFixture();
        const assignment = createUserRoleFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockRolesRepo.findById.mockResolvedValue(role);
        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(undefined);
        mockUserRolesRepo.assign.mockResolvedValue(assignment);
        mockAuditLog.mockResolvedValue(undefined);

        await service.assignRole(user.id, role.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'assign',
            resource: 'user_role',
            resourceId: assignment.id,
          }),
        );
      });

      it('should throw UserNotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.assignRole('user-1', 'role-1', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotFoundError);
      });

      it('should throw UserNotActiveError for non-active user', async () => {
        const user = createSuspendedUserFixture();

        mockUsersRepo.findById.mockResolvedValue(user);

        await expect(
          service.assignRole(user.id, 'role-1', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotActiveError);
      });

      it('should throw RoleNotFoundError for non-existent role', async () => {
        const user = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.assignRole(user.id, 'role-1', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(RoleNotFoundError);
      });

      it('should reject duplicate role assignment', async () => {
        const user = createUserFixture();
        const role = createRoleFixture();
        const existingAssignment = createUserRoleFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockRolesRepo.findById.mockResolvedValue(role);
        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(existingAssignment);

        await expect(
          service.assignRole(user.id, role.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserRoleAlreadyExistsError);
      });
    });

    describe('revokeRole', () => {
      it('should revoke role from user', async () => {
        const existingAssignment = createUserRoleFixture();
        const role = createRoleFixture();

        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(existingAssignment);
        mockRolesRepo.findById.mockResolvedValue(role);
        mockUserRolesRepo.remove.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.revokeRole(
          existingAssignment.userId,
          existingAssignment.roleId,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockUserRolesRepo.remove).toHaveBeenCalledWith(
          existingAssignment.userId,
          existingAssignment.roleId,
        );
      });

      it('should create audit log entry', async () => {
        const existingAssignment = createUserRoleFixture();
        const role = createRoleFixture();

        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(existingAssignment);
        mockRolesRepo.findById.mockResolvedValue(role);
        mockUserRolesRepo.remove.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.revokeRole(
          existingAssignment.userId,
          existingAssignment.roleId,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'revoke',
            resource: 'user_role',
            resourceId: existingAssignment.id,
          }),
        );
      });

      it('should throw UserRoleNotFoundError for non-existent assignment', async () => {
        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(undefined);

        await expect(
          service.revokeRole('user-1', 'role-1', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserRoleNotFoundError);
      });

      it('should throw RoleNotFoundError if role does not exist in tenant', async () => {
        const existingAssignment = createUserRoleFixture();

        mockUserRolesRepo.findByUserAndRole.mockResolvedValue(existingAssignment);
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.revokeRole(
            existingAssignment.userId,
            existingAssignment.roleId,
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(RoleNotFoundError);
      });
    });

    describe('listUserRoles', () => {
      it('should return roles for a user', async () => {
        const user = createUserFixture();
        const roles = [createUserRoleFixture()];

        mockUsersRepo.findById.mockResolvedValue(user);
        mockUserRolesRepo.findByUserId.mockResolvedValue(roles);

        const result = await service.listUserRoles(user.id, TEST_TENANT_ID);

        expect(result).toEqual(roles);
        expect(mockUserRolesRepo.findByUserId).toHaveBeenCalledWith(user.id);
      });

      it('should return empty array when user has no roles', async () => {
        const user = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockUserRolesRepo.findByUserId.mockResolvedValue([]);

        const result = await service.listUserRoles(user.id, TEST_TENANT_ID);

        expect(result).toHaveLength(0);
      });

      it('should throw UserNotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(service.listUserRoles('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          UserNotFoundError,
        );
      });

      it('should scope user lookup to tenant', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(service.listUserRoles('user-1', OTHER_TENANT_ID)).rejects.toThrow(
          UserNotFoundError,
        );
        expect(mockUsersRepo.findById).toHaveBeenCalledWith('user-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISSION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Permission Service', () => {
    describe('createPermission', () => {
      it('should create permission with valid data', async () => {
        const permission = createPermissionFixture();
        const role = createRoleFixture();

        mockRolesRepo.findById.mockResolvedValue(role);
        mockPermissionsRepo.findByRoleAndResource.mockResolvedValue(undefined);
        mockPermissionsRepo.create.mockResolvedValue(permission);
        mockAuditLog.mockResolvedValue(undefined);

        const result = await service.createPermission(
          { roleId: permission.roleId, resource: permission.resource, action: permission.action },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(permission);
        expect(mockPermissionsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            roleId: permission.roleId,
            resource: permission.resource,
            action: permission.action,
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should create audit log entry', async () => {
        const permission = createPermissionFixture();
        const role = createRoleFixture();

        mockRolesRepo.findById.mockResolvedValue(role);
        mockPermissionsRepo.findByRoleAndResource.mockResolvedValue(undefined);
        mockPermissionsRepo.create.mockResolvedValue(permission);
        mockAuditLog.mockResolvedValue(undefined);

        await service.createPermission(
          { roleId: permission.roleId, resource: permission.resource, action: permission.action },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'create',
            resource: 'permission',
            resourceId: permission.id,
          }),
        );
      });

      it('should throw RoleNotFoundError for non-existent role', async () => {
        mockRolesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createPermission(
            { roleId: 'role-1', resource: 'invoice', action: 'create' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(RoleNotFoundError);
      });

      it('should reject duplicate permission on same role + resource + action', async () => {
        const existing = createPermissionFixture();
        const role = createRoleFixture();

        mockRolesRepo.findById.mockResolvedValue(role);
        mockPermissionsRepo.findByRoleAndResource.mockResolvedValue(existing);

        await expect(
          service.createPermission(
            { roleId: existing.roleId, resource: existing.resource, action: existing.action },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(DuplicatePermissionError);
      });
    });

    describe('getPermission', () => {
      it('should return permission by id', async () => {
        const permission = createPermissionFixture();
        mockPermissionsRepo.findById.mockResolvedValue(permission);

        const result = await service.getPermission(permission.id, TEST_TENANT_ID);

        expect(result).toEqual(permission);
        expect(mockPermissionsRepo.findById).toHaveBeenCalledWith(permission.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent permission', async () => {
        mockPermissionsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPermission('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PermissionNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockPermissionsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPermission('perm-1', OTHER_TENANT_ID)).rejects.toThrow(
          PermissionNotFoundError,
        );
        expect(mockPermissionsRepo.findById).toHaveBeenCalledWith('perm-1', OTHER_TENANT_ID);
      });
    });

    describe('listPermissions', () => {
      it('should return paginated permissions', async () => {
        const permissions = [createPermissionFixture()];
        mockPermissionsRepo.findMany.mockResolvedValue({ data: permissions, total: 1 });

        const result = await service.listPermissions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no permissions exist', async () => {
        mockPermissionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listPermissions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter permissions by roleId', async () => {
        const permissions = [createPermissionFixture()];
        mockPermissionsRepo.findByRoleId.mockResolvedValue(permissions);

        const result = await service.listPermissions(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          roleId: 'role-1',
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockPermissionsRepo.findByRoleId).toHaveBeenCalledWith('role-1', TEST_TENANT_ID);
      });

      it('should calculate correct offset for pagination', async () => {
        mockPermissionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPermissions(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockPermissionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockPermissionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPermissions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockPermissionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('deletePermission', () => {
      it('should delete permission', async () => {
        const existing = createPermissionFixture();

        mockPermissionsRepo.findById.mockResolvedValue(existing);
        mockPermissionsRepo.delete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deletePermission(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockPermissionsRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should create audit log entry', async () => {
        const existing = createPermissionFixture();

        mockPermissionsRepo.findById.mockResolvedValue(existing);
        mockPermissionsRepo.delete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.deletePermission(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'delete',
            resource: 'permission',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent permission', async () => {
        mockPermissionsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deletePermission('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PermissionNotFoundError);
      });

      it('should scope deletion to tenant', async () => {
        mockPermissionsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deletePermission('perm-1', OTHER_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PermissionNotFoundError);
        expect(mockPermissionsRepo.findById).toHaveBeenCalledWith('perm-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Session Service', () => {
    describe('listSessions', () => {
      it('should return paginated sessions', async () => {
        const sessions = [createSessionFixture()];
        mockSessionsRepo.findMany.mockResolvedValue({ data: sessions, total: 1 });

        const result = await service.listSessions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no sessions exist', async () => {
        mockSessionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listSessions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockSessionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listSessions(TEST_TENANT_ID, { page: 3, limit: 5 });

        expect(mockSessionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 5, offset: 10 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockSessionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listSessions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockSessionsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('invalidateSession', () => {
      it('should invalidate existing session', async () => {
        const existing = createSessionFixture();

        mockSessionsRepo.findById.mockResolvedValue(existing);
        mockSessionsRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.invalidateSession(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockSessionsRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should create audit log entry', async () => {
        const existing = createSessionFixture();

        mockSessionsRepo.findById.mockResolvedValue(existing);
        mockSessionsRepo.softDelete.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.invalidateSession(existing.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'invalidate',
            resource: 'session',
            resourceId: existing.id,
          }),
        );
      });

      it('should throw NotFoundError for non-existent session', async () => {
        mockSessionsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.invalidateSession('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(SessionNotFoundError);
      });

      it('should scope invalidation to tenant', async () => {
        mockSessionsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.invalidateSession('sess-1', OTHER_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(SessionNotFoundError);
        expect(mockSessionsRepo.findById).toHaveBeenCalledWith('sess-1', OTHER_TENANT_ID);
      });
    });

    describe('invalidateAllUserSessions', () => {
      it('should invalidate all sessions for a user', async () => {
        const user = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.invalidateAllUserSessions(user.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockSessionsRepo.deleteAllForUser).toHaveBeenCalledWith(user.id, TEST_TENANT_ID);
      });

      it('should create audit log entry', async () => {
        const user = createUserFixture();

        mockUsersRepo.findById.mockResolvedValue(user);
        mockSessionsRepo.deleteAllForUser.mockResolvedValue(undefined);
        mockAuditLog.mockResolvedValue(undefined);

        await service.invalidateAllUserSessions(user.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockAuditLog).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            action: 'invalidate_all',
            resource: 'session',
          }),
        );
      });

      it('should throw UserNotFoundError for non-existent user', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.invalidateAllUserSessions('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotFoundError);
      });

      it('should scope user lookup to tenant', async () => {
        mockUsersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.invalidateAllUserSessions('user-1', OTHER_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(UserNotFoundError);
        expect(mockUsersRepo.findById).toHaveBeenCalledWith('user-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Audit Log Service', () => {
    describe('listAuditLogs', () => {
      it('should return paginated audit logs', async () => {
        const logs = [createAuditLogFixture()];
        mockListLogEntries.mockResolvedValue({ data: logs, total: 1 });

        const result = await service.listAuditLogs(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no audit logs exist', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAuditLogs(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockListLogEntries).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 10 }),
        );
      });

      it('should filter by userId', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          userId: 'user-1',
        });

        expect(mockListLogEntries).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ userId: 'user-1' }),
        );
      });

      it('should filter by action', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          action: 'create',
        });

        expect(mockListLogEntries).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ action: 'create' }),
        );
      });

      it('should filter by resource', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          resource: 'user',
        });

        expect(mockListLogEntries).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ resource: 'user' }),
        );
      });

      it('should filter by multiple criteria', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          userId: 'user-1',
          action: 'create',
          resource: 'user',
        });

        expect(mockListLogEntries).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({
            userId: 'user-1',
            action: 'create',
            resource: 'user',
          }),
        );
      });

      it('should pass tenantId to service', async () => {
        mockListLogEntries.mockResolvedValue({ data: [], total: 0 });

        await service.listAuditLogs(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockListLogEntries).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });
  });
});
