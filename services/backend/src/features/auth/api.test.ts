import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.name = 'APIError';
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
vi.mock('~encore/auth', () => ({
  getAuthData: () => mockGetAuthData(),
}));

vi.mock('../../lib/errors', () => ({
  ValidationError: class MockValidationError extends Error {
    code = 'VALIDATION_ERROR';
    status = 400;
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  },
}));

vi.mock('./service', () => ({
  createUser: vi.fn(),
  getUser: vi.fn(),
  listUsers: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  createRole: vi.fn(),
  getRole: vi.fn(),
  listRoles: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  assignRole: vi.fn(),
  revokeRole: vi.fn(),
  listUserRoles: vi.fn(),
  createPermission: vi.fn(),
  getPermission: vi.fn(),
  listPermissions: vi.fn(),
  deletePermission: vi.fn(),
  listSessions: vi.fn(),
  invalidateSession: vi.fn(),
  invalidateAllUserSessions: vi.fn(),
  listAuditLogs: vi.fn(),
}));

// ─── Import handlers AFTER mocking ───────────────────────────────────────────

import {
  assignRole,
  createPermission,
  createRole,
  createUser,
  deletePermission,
  deleteRole,
  deleteUser,
  getPermission,
  getRole,
  getUser,
  invalidateAllUserSessions,
  invalidateSession,
  listAuditLogs,
  listPermissions,
  listRoles,
  listSessions,
  listUserRoles,
  listUsers,
  revokeRole,
  updatePermission,
  updateRole,
  updateUser,
} from './api';
import * as svc from './service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockAuth = { tenantId: TEST_TENANT_ID, userId: TEST_USER_ID };
const UUID = '550e8400-e29b-41d4-a716-446655440000';
const INVALID_UUID = 'not-a-uuid';

function expectUnauthenticated(promise: Promise<unknown>) {
  return expect(promise).rejects.toMatchObject({
    code: 'unauthenticated',
  });
}

function expectValidationError(promise: Promise<unknown>) {
  return expect(promise).rejects.toThrow();
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockAuth);
});

// ─── createUser ──────────────────────────────────────────────────────────────

describe('createUser', () => {
  it('creates a user with valid input', async () => {
    const input = { email: 'a@b.com', name: 'Test', username: 'test' };
    vi.mocked(svc.createUser).mockResolvedValue({ id: 'u1', ...input, status: 'active' } as never);

    const result = await createUser(input);

    expect(svc.createUser).toHaveBeenCalledWith(
      { email: 'a@b.com', name: 'Test', username: 'test', status: 'active' },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual({ id: 'u1', ...input, status: 'active' });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(createUser({ email: 'a@b.com', name: 'Test', username: 'test' }));
  });

  it('throws ValidationError for invalid email', async () => {
    await expectValidationError(createUser({ email: 'not-email', name: 'Test', username: 'test' }));
  });

  it('throws ValidationError for missing name', async () => {
    await expectValidationError(createUser({ email: 'a@b.com', name: '', username: 'test' }));
  });

  it('propagates service errors', async () => {
    const err = new Error('duplicate email');
    vi.mocked(svc.createUser).mockRejectedValue(err);

    await expect(createUser({ email: 'a@b.com', name: 'Test', username: 'test' })).rejects.toThrow(
      'duplicate email',
    );
  });
});

// ─── getUser ─────────────────────────────────────────────────────────────────

describe('getUser', () => {
  it('returns a user by id', async () => {
    const user = { id: UUID, name: 'Test' };
    vi.mocked(svc.getUser).mockResolvedValue(user as never);

    const result = await getUser({ id: UUID });

    expect(svc.getUser).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(result).toEqual(user);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(getUser({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.getUser).mockRejectedValue(new Error('not found'));

    await expect(getUser({ id: UUID })).rejects.toThrow('not found');
  });
});

// ─── listUsers ───────────────────────────────────────────────────────────────

describe('listUsers', () => {
  it('lists users with default pagination', async () => {
    const response = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(svc.listUsers).mockResolvedValue(response as never);

    const result = await listUsers({});

    expect(svc.listUsers).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
    });
    expect(result).toEqual(response);
  });

  it('passes status filter through', async () => {
    vi.mocked(svc.listUsers).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await listUsers({ status: 'active' });

    expect(svc.listUsers).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: 'active',
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listUsers({}));
  });

  it('rejects invalid page value', async () => {
    await expectValidationError(listUsers({ page: -1 }));
  });

  it('rejects limit over 100', async () => {
    await expectValidationError(listUsers({ limit: 200 }));
  });
});

// ─── updateUser ──────────────────────────────────────────────────────────────

describe('updateUser', () => {
  it('updates a user with valid input', async () => {
    const updated = { id: UUID, name: 'Updated' };
    vi.mocked(svc.updateUser).mockResolvedValue(updated as never);

    const result = await updateUser({ id: UUID, name: 'Updated' });

    expect(svc.updateUser).toHaveBeenCalledWith(
      UUID,
      { name: 'Updated' },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(updated);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(updateUser({ id: UUID, name: 'X' }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.updateUser).mockRejectedValue(new Error('not found'));

    await expect(updateUser({ id: UUID, name: 'X' })).rejects.toThrow('not found');
  });
});

// ─── deleteUser ──────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  it('deletes a user', async () => {
    vi.mocked(svc.deleteUser).mockResolvedValue(undefined);

    await deleteUser({ id: UUID });

    expect(svc.deleteUser).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(deleteUser({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.deleteUser).mockRejectedValue(new Error('cannot delete self'));

    await expect(deleteUser({ id: UUID })).rejects.toThrow('cannot delete self');
  });
});

// ─── createRole ──────────────────────────────────────────────────────────────

describe('createRole', () => {
  it('creates a role with valid input', async () => {
    const input = { name: 'Admin', description: 'Admin role' };
    const role = { id: 'r1', ...input, isSystem: false };
    vi.mocked(svc.createRole).mockResolvedValue(role as never);

    const result = await createRole(input);

    expect(svc.createRole).toHaveBeenCalledWith(
      { name: 'Admin', description: 'Admin role', isSystem: false },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(role);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(createRole({ name: 'Admin' }));
  });

  it('throws ValidationError for missing name', async () => {
    await expectValidationError(createRole({ name: '' }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.createRole).mockRejectedValue(new Error('duplicate role name'));

    await expect(createRole({ name: 'Admin' })).rejects.toThrow('duplicate role name');
  });
});

// ─── getRole ─────────────────────────────────────────────────────────────────

describe('getRole', () => {
  it('returns a role by id', async () => {
    const role = { id: UUID, name: 'Admin' };
    vi.mocked(svc.getRole).mockResolvedValue(role as never);

    const result = await getRole({ id: UUID });

    expect(svc.getRole).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(result).toEqual(role);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(getRole({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.getRole).mockRejectedValue(new Error('role not found'));

    await expect(getRole({ id: UUID })).rejects.toThrow('role not found');
  });
});

// ─── listRoles ───────────────────────────────────────────────────────────────

describe('listRoles', () => {
  it('lists roles with default pagination', async () => {
    const response = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(svc.listRoles).mockResolvedValue(response as never);

    const result = await listRoles({});

    expect(svc.listRoles).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    expect(result).toEqual(response);
  });

  it('passes custom pagination params', async () => {
    vi.mocked(svc.listRoles).mockResolvedValue({ data: [], total: 0, page: 2, limit: 10 } as never);

    const result = await listRoles({ page: 2, limit: 10 });

    expect(svc.listRoles).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 2, limit: 10 });
    expect(result.page).toBe(2);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listRoles({}));
  });

  it('rejects invalid pagination', async () => {
    await expectValidationError(listRoles({ page: 0 }));
  });
});

// ─── updateRole ──────────────────────────────────────────────────────────────

describe('updateRole', () => {
  it('updates a role with valid input', async () => {
    const updated = { id: UUID, name: 'Updated Role' };
    vi.mocked(svc.updateRole).mockResolvedValue(updated as never);

    const result = await updateRole({ id: UUID, name: 'Updated Role' });

    expect(svc.updateRole).toHaveBeenCalledWith(
      UUID,
      { name: 'Updated Role' },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(updated);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(updateRole({ id: UUID, name: 'X' }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.updateRole).mockRejectedValue(new Error('cannot modify system role'));

    await expect(updateRole({ id: UUID, name: 'X' })).rejects.toThrow('cannot modify system role');
  });
});

// ─── deleteRole ──────────────────────────────────────────────────────────────

describe('deleteRole', () => {
  it('deletes a role', async () => {
    vi.mocked(svc.deleteRole).mockResolvedValue(undefined);

    await deleteRole({ id: UUID });

    expect(svc.deleteRole).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(deleteRole({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.deleteRole).mockRejectedValue(new Error('cannot delete system role'));

    await expect(deleteRole({ id: UUID })).rejects.toThrow('cannot delete system role');
  });
});

// ─── assignRole ──────────────────────────────────────────────────────────────

describe('assignRole', () => {
  it('assigns a role to a user', async () => {
    const assignment = { id: 'ur1', userId: UUID, roleId: UUID };
    vi.mocked(svc.assignRole).mockResolvedValue(assignment as never);

    const result = await assignRole({ userId: UUID, roleId: UUID });

    expect(svc.assignRole).toHaveBeenCalledWith(UUID, UUID, TEST_TENANT_ID, TEST_USER_ID);
    expect(result).toEqual(assignment);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(assignRole({ userId: UUID, roleId: UUID }));
  });

  it('throws ValidationError for invalid userId', async () => {
    await expectValidationError(assignRole({ userId: INVALID_UUID, roleId: UUID }));
  });

  it('throws ValidationError for invalid roleId', async () => {
    await expectValidationError(assignRole({ userId: UUID, roleId: INVALID_UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.assignRole).mockRejectedValue(new Error('user not found'));

    await expect(assignRole({ userId: UUID, roleId: UUID })).rejects.toThrow('user not found');
  });
});

// ─── revokeRole ──────────────────────────────────────────────────────────────

describe('revokeRole', () => {
  it('revokes a role from a user', async () => {
    vi.mocked(svc.revokeRole).mockResolvedValue(undefined);

    await revokeRole({ userId: UUID, roleId: UUID });

    expect(svc.revokeRole).toHaveBeenCalledWith(UUID, UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(revokeRole({ userId: UUID, roleId: UUID }));
  });

  it('throws ValidationError for invalid userId', async () => {
    await expectValidationError(revokeRole({ userId: 'bad', roleId: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.revokeRole).mockRejectedValue(new Error('user role not found'));

    await expect(revokeRole({ userId: UUID, roleId: UUID })).rejects.toThrow('user role not found');
  });
});

// ─── listUserRoles ───────────────────────────────────────────────────────────

describe('listUserRoles', () => {
  it('returns roles for a user', async () => {
    const roles = [{ id: 'ur1', userId: UUID, roleId: UUID }];
    vi.mocked(svc.listUserRoles).mockResolvedValue(roles as never);

    const result = await listUserRoles({ userId: UUID });

    expect(svc.listUserRoles).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(result).toEqual(roles);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listUserRoles({ userId: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.listUserRoles).mockRejectedValue(new Error('user not found'));

    await expect(listUserRoles({ userId: UUID })).rejects.toThrow('user not found');
  });
});

// ─── createPermission ────────────────────────────────────────────────────────

describe('createPermission', () => {
  it('creates a permission with valid input', async () => {
    const input = { roleId: UUID, resource: 'invoice', action: 'create' };
    const perm = { id: 'p1', ...input };
    vi.mocked(svc.createPermission).mockResolvedValue(perm as never);

    const result = await createPermission(input);

    expect(svc.createPermission).toHaveBeenCalledWith(input, TEST_TENANT_ID, TEST_USER_ID);
    expect(result).toEqual(perm);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(
      createPermission({ roleId: UUID, resource: 'invoice', action: 'create' }),
    );
  });

  it('throws ValidationError for invalid roleId', async () => {
    await expectValidationError(
      createPermission({ roleId: INVALID_UUID, resource: 'invoice', action: 'create' }),
    );
  });

  it('throws ValidationError for missing resource', async () => {
    await expectValidationError(createPermission({ roleId: UUID, resource: '', action: 'create' }));
  });

  it('throws ValidationError for missing action', async () => {
    await expectValidationError(
      createPermission({ roleId: UUID, resource: 'invoice', action: '' }),
    );
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.createPermission).mockRejectedValue(new Error('role not found'));

    await expect(
      createPermission({ roleId: UUID, resource: 'invoice', action: 'create' }),
    ).rejects.toThrow('role not found');
  });
});

// ─── getPermission ───────────────────────────────────────────────────────────

describe('getPermission', () => {
  it('returns a permission by id', async () => {
    const perm = { id: UUID, resource: 'invoice', action: 'create' };
    vi.mocked(svc.getPermission).mockResolvedValue(perm as never);

    const result = await getPermission({ id: UUID });

    expect(svc.getPermission).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(result).toEqual(perm);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(getPermission({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.getPermission).mockRejectedValue(new Error('permission not found'));

    await expect(getPermission({ id: UUID })).rejects.toThrow('permission not found');
  });
});

// ─── listPermissions ─────────────────────────────────────────────────────────

describe('listPermissions', () => {
  it('lists permissions with default pagination', async () => {
    const response = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(svc.listPermissions).mockResolvedValue(response as never);

    const result = await listPermissions({});

    expect(svc.listPermissions).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      roleId: undefined,
    });
    expect(result).toEqual(response);
  });

  it('passes roleId filter through', async () => {
    vi.mocked(svc.listPermissions).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    } as never);

    await listPermissions({ roleId: UUID });

    expect(svc.listPermissions).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      roleId: UUID,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listPermissions({}));
  });

  it('rejects invalid page', async () => {
    await expectValidationError(listPermissions({ page: -5 }));
  });
});

// ─── updatePermission ────────────────────────────────────────────────────────

describe('updatePermission', () => {
  it('updates a permission via delete+recreate', async () => {
    const existing = { id: UUID, roleId: UUID, resource: 'invoice', action: 'create' };
    const newPerm = { id: 'p2', roleId: UUID, resource: 'invoice', action: 'update' };
    vi.mocked(svc.getPermission).mockResolvedValue(existing as never);
    vi.mocked(svc.deletePermission).mockResolvedValue(undefined);
    vi.mocked(svc.createPermission).mockResolvedValue(newPerm as never);

    const result = await updatePermission({ id: UUID, action: 'update' });

    expect(svc.getPermission).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(svc.deletePermission).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
    expect(svc.createPermission).toHaveBeenCalledWith(
      { roleId: UUID, resource: 'invoice', action: 'update' },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(newPerm);
  });

  it('falls back to existing resource when not provided', async () => {
    const existing = { id: UUID, roleId: UUID, resource: 'invoice', action: 'create' };
    const newPerm = { id: 'p2', roleId: UUID, resource: 'invoice', action: 'read' };
    vi.mocked(svc.getPermission).mockResolvedValue(existing as never);
    vi.mocked(svc.deletePermission).mockResolvedValue(undefined);
    vi.mocked(svc.createPermission).mockResolvedValue(newPerm as never);

    await updatePermission({ id: UUID, action: 'read' });

    expect(svc.createPermission).toHaveBeenCalledWith(
      { roleId: UUID, resource: 'invoice', action: 'read' },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(updatePermission({ id: UUID, action: 'x' }));
  });

  it('propagates getPermission errors', async () => {
    vi.mocked(svc.getPermission).mockRejectedValue(new Error('permission not found'));

    await expect(updatePermission({ id: UUID, action: 'x' })).rejects.toThrow(
      'permission not found',
    );
  });

  it('propagates deletePermission errors', async () => {
    vi.mocked(svc.getPermission).mockResolvedValue({
      id: UUID,
      roleId: UUID,
      resource: 'r',
      action: 'a',
    } as never);
    vi.mocked(svc.deletePermission).mockRejectedValue(new Error('delete failed'));

    await expect(updatePermission({ id: UUID, action: 'x' })).rejects.toThrow('delete failed');
  });

  it('propagates createPermission errors during recreate', async () => {
    vi.mocked(svc.getPermission).mockResolvedValue({
      id: UUID,
      roleId: UUID,
      resource: 'r',
      action: 'a',
    } as never);
    vi.mocked(svc.deletePermission).mockResolvedValue(undefined);
    vi.mocked(svc.createPermission).mockRejectedValue(new Error('create failed'));

    await expect(updatePermission({ id: UUID, action: 'x' })).rejects.toThrow('create failed');
  });
});

// ─── deletePermission ────────────────────────────────────────────────────────

describe('deletePermission', () => {
  it('deletes a permission', async () => {
    vi.mocked(svc.deletePermission).mockResolvedValue(undefined);

    await deletePermission({ id: UUID });

    expect(svc.deletePermission).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(deletePermission({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.deletePermission).mockRejectedValue(new Error('permission not found'));

    await expect(deletePermission({ id: UUID })).rejects.toThrow('permission not found');
  });
});

// ─── listSessions ────────────────────────────────────────────────────────────

describe('listSessions', () => {
  it('lists sessions with default pagination', async () => {
    const response = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(svc.listSessions).mockResolvedValue(response as never);

    const result = await listSessions({});

    expect(svc.listSessions).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    expect(result).toEqual(response);
  });

  it('passes custom pagination', async () => {
    vi.mocked(svc.listSessions).mockResolvedValue({
      data: [],
      total: 0,
      page: 3,
      limit: 50,
    } as never);

    const result = await listSessions({ page: 3, limit: 50 });

    expect(svc.listSessions).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 3, limit: 50 });
    expect(result.page).toBe(3);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listSessions({}));
  });
});

// ─── invalidateSession ───────────────────────────────────────────────────────

describe('invalidateSession', () => {
  it('invalidates a session', async () => {
    vi.mocked(svc.invalidateSession).mockResolvedValue(undefined);

    await invalidateSession({ id: UUID });

    expect(svc.invalidateSession).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(invalidateSession({ id: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.invalidateSession).mockRejectedValue(new Error('session not found'));

    await expect(invalidateSession({ id: UUID })).rejects.toThrow('session not found');
  });
});

// ─── invalidateAllUserSessions ───────────────────────────────────────────────

describe('invalidateAllUserSessions', () => {
  it('invalidates all sessions for a user', async () => {
    vi.mocked(svc.invalidateAllUserSessions).mockResolvedValue(undefined);

    await invalidateAllUserSessions({ userId: UUID });

    expect(svc.invalidateAllUserSessions).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(invalidateAllUserSessions({ userId: UUID }));
  });

  it('propagates service errors', async () => {
    vi.mocked(svc.invalidateAllUserSessions).mockRejectedValue(new Error('user not found'));

    await expect(invalidateAllUserSessions({ userId: UUID })).rejects.toThrow('user not found');
  });
});

// ─── listAuditLogs ───────────────────────────────────────────────────────────

describe('listAuditLogs', () => {
  it('lists audit logs with default pagination', async () => {
    const response = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(svc.listAuditLogs).mockResolvedValue(response as never);

    const result = await listAuditLogs({});

    expect(svc.listAuditLogs).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      userId: undefined,
      action: undefined,
      resource: undefined,
    });
    expect(result).toEqual(response);
  });

  it('passes all filter params through', async () => {
    vi.mocked(svc.listAuditLogs).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    } as never);

    await listAuditLogs({ page: 1, limit: 10, userId: UUID, action: 'create', resource: 'user' });

    expect(svc.listAuditLogs).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      userId: UUID,
      action: 'create',
      resource: 'user',
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expectUnauthenticated(listAuditLogs({}));
  });

  it('rejects invalid page value', async () => {
    await expectValidationError(listAuditLogs({ page: -1 }));
  });

  it('rejects limit exceeding max', async () => {
    await expectValidationError(listAuditLogs({ limit: 999 }));
  });
});
