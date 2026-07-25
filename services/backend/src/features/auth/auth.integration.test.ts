vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString = process.env.DATABASE_URL!;
    constructor(_name: string, _opts?: unknown) {}
  },
}));

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn(() => (fn: unknown) => fn),
}));

vi.mock('../audit/client', () => ({
  auditLog: vi.fn(),
}));

import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { db as testDb } from '../../database';
import { users, roles, userRoles } from '@lumora/database/schema';
import { sessions, permissions } from '@lumora/database/schema/auth/schema';
import { auditLogEntries } from '@lumora/database/schema/audit/schema';
import { eq, and, sql } from 'drizzle-orm';
import * as service from './service';
import {
  DuplicateEmailError,
  DuplicateUsernameError,
  DuplicateRoleNameError,
  DuplicatePermissionError,
  UserRoleAlreadyExistsError,
  UserNotFoundError,
  RoleNotFoundError,
  CannotDeleteSystemRoleError,
} from './errors';

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000002';
const OTHER_TENANT_ID = '00000000-0000-0000-0000-000000000003';

async function cleanupAuthData(): Promise<void> {
  await testDb.execute(sql`DELETE FROM audit_log_entries WHERE tenant_id = ${TEST_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM audit_log_entries WHERE tenant_id = ${OTHER_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM sessions WHERE tenant_id = ${TEST_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM sessions WHERE tenant_id = ${OTHER_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM user_roles`);
  await testDb.execute(sql`DELETE FROM permissions WHERE tenant_id = ${TEST_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM permissions WHERE tenant_id = ${OTHER_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM users WHERE tenant_id = ${TEST_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM users WHERE tenant_id = ${OTHER_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM roles WHERE tenant_id = ${TEST_TENANT_ID}`);
  await testDb.execute(sql`DELETE FROM roles WHERE tenant_id = ${OTHER_TENANT_ID}`);
}

async function findUserById(id: string) {
  const rows = await testDb.select().from(users).where(eq(users.id, id));
  return rows[0];
}

async function findUserByEmail(email: string) {
  return testDb.select().from(users).where(and(eq(users.email, email), eq(users.tenantId, TEST_TENANT_ID)));
}

async function findRoleById(id: string) {
  const rows = await testDb.select().from(roles).where(eq(roles.id, id));
  return rows[0];
}

async function findUserRole(userId: string, roleId: string) {
  const rows = await testDb.select().from(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  return rows[0];
}

async function findPermissionById(id: string) {
  const rows = await testDb.select().from(permissions).where(eq(permissions.id, id));
  return rows[0];
}

async function findSessionById(id: string) {
  const rows = await testDb.select().from(sessions).where(eq(sessions.id, id));
  return rows[0];
}

let userId1: string;
let roleId1: string;

beforeAll(async () => {
  await cleanupAuthData();
});

afterAll(async () => {
  await cleanupAuthData();
});

describe('User Lifecycle (create → get → update → delete)', () => {
  it('should create a user and verify in DB', async () => {
    const user = await service.createUser(
      { email: 'lifecycle-1@example.com', name: 'Lifecycle User', username: 'lifecycle1' },
      TEST_TENANT_ID, TEST_USER_ID,
    );
    userId1 = user.id;
    expect(user.email).toBe('lifecycle-1@example.com');
    expect(user.status).toBe('active');

    const dbRow = await findUserById(user.id);
    expect(dbRow).toBeDefined();
    expect(dbRow!.deletedAt).toBeNull();
  });

  it('should get a user by id through service', async () => {
    const user = await service.getUser(userId1, TEST_TENANT_ID);
    expect(user.id).toBe(userId1);
  });

  it('should update a user and verify DB reflects changes', async () => {
    const updated = await service.updateUser(userId1, { name: 'Updated', status: 'suspended' }, TEST_TENANT_ID, TEST_USER_ID);
    expect(updated.name).toBe('Updated');
    const dbRow = await findUserById(userId1);
    expect(dbRow!.name).toBe('Updated');
  });

  it('should soft delete a user and verify deletedAt is set', async () => {
    await service.deleteUser(userId1, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findUserById(userId1);
    expect(dbRow!.deletedAt).not.toBeNull();
    await expect(service.getUser(userId1, TEST_TENANT_ID)).rejects.toThrow(UserNotFoundError);
  });
});

describe('Email Uniqueness', () => {
  it('should throw DuplicateEmailError when creating user with existing email', async () => {
    await service.createUser({ email: 'dup-email@example.com', name: 'First', username: 'dup-email-first' }, TEST_TENANT_ID, TEST_USER_ID);
    await expect(
      service.createUser({ email: 'dup-email@example.com', name: 'Second', username: 'dup-email-second' }, TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow(DuplicateEmailError);
    const rows = await findUserByEmail('dup-email@example.com');
    expect(rows.length).toBe(1);
  });
});

describe('Username Uniqueness', () => {
  it('should throw DuplicateUsernameError when creating user with existing username', async () => {
    await service.createUser({ email: 'dup-u1@example.com', name: 'First', username: 'dupusername' }, TEST_TENANT_ID, TEST_USER_ID);
    await expect(
      service.createUser({ email: 'dup-u2@example.com', name: 'Second', username: 'dupusername' }, TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow(DuplicateUsernameError);
  });
});

describe('Role Lifecycle (create → get → update → delete)', () => {
  it('should create a role and verify in DB', async () => {
    const role = await service.createRole({ name: 'Test Admin', description: 'Test admin role' }, TEST_TENANT_ID, TEST_USER_ID);
    roleId1 = role.id;
    expect(role.name).toBe('Test Admin');
    const dbRow = await findRoleById(role.id);
    expect(dbRow).toBeDefined();
    expect(dbRow!.deletedAt).toBeNull();
  });

  it('should get a role by id', async () => {
    const role = await service.getRole(roleId1, TEST_TENANT_ID);
    expect(role.id).toBe(roleId1);
  });

  it('should update a role and verify DB reflects changes', async () => {
    const updated = await service.updateRole(roleId1, { name: 'Super Admin', description: 'Updated' }, TEST_TENANT_ID, TEST_USER_ID);
    expect(updated.name).toBe('Super Admin');
    const dbRow = await findRoleById(roleId1);
    expect(dbRow!.name).toBe('Super Admin');
  });

  it('should soft delete a non-system role', async () => {
    const temp = await service.createRole({ name: 'Temp Role' }, TEST_TENANT_ID, TEST_USER_ID);
    await service.deleteRole(temp.id, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findRoleById(temp.id);
    expect(dbRow!.deletedAt).not.toBeNull();
    await expect(service.getRole(temp.id, TEST_TENANT_ID)).rejects.toThrow(RoleNotFoundError);
  });

  it('should reject deleting a system role', async () => {
    const sys = await service.createRole({ name: 'Sys Role', isSystem: true }, TEST_TENANT_ID, TEST_USER_ID);
    await expect(service.deleteRole(sys.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(CannotDeleteSystemRoleError);
  });
});

describe('Role Name Uniqueness', () => {
  it('should throw DuplicateRoleNameError for duplicate role name in same tenant', async () => {
    await service.createRole({ name: 'Unique Role' }, TEST_TENANT_ID, TEST_USER_ID);
    await expect(service.createRole({ name: 'Unique Role' }, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(DuplicateRoleNameError);
  });

  it('should allow same role name in different tenants', async () => {
    await service.createRole({ name: 'Tenant Scoped Role' }, OTHER_TENANT_ID, TEST_USER_ID);
    const role = await service.createRole({ name: 'Tenant Scoped Role' }, TEST_TENANT_ID, TEST_USER_ID);
    expect(role.tenantId).toBe(TEST_TENANT_ID);
  });
});

describe('User Role Assignment', () => {
  let assignmentUserId: string;
  let assignmentRoleId: string;

  it('should assign a role to a user', async () => {
    const user = await service.createUser({ email: 'assign-role@example.com', name: 'Assign', username: 'assignrole' }, TEST_TENANT_ID, TEST_USER_ID);
    assignmentUserId = user.id;
    const role = await service.createRole({ name: 'Assign Role' }, TEST_TENANT_ID, TEST_USER_ID);
    assignmentRoleId = role.id;
    const assignment = await service.assignRole(assignmentUserId, assignmentRoleId, TEST_TENANT_ID, TEST_USER_ID);
    expect(assignment.userId).toBe(assignmentUserId);
    const dbRow = await findUserRole(assignmentUserId, assignmentRoleId);
    expect(dbRow).toBeDefined();
  });

  it('should list roles for a user', async () => {
    const list = await service.listUserRoles(assignmentUserId, TEST_TENANT_ID);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((ur) => ur.roleId === assignmentRoleId)).toBe(true);
  });

  it('should reject duplicate role assignment', async () => {
    await expect(service.assignRole(assignmentUserId, assignmentRoleId, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(UserRoleAlreadyExistsError);
  });

  it('should remove a role from a user', async () => {
    await service.revokeRole(assignmentUserId, assignmentRoleId, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findUserRole(assignmentUserId, assignmentRoleId);
    expect(dbRow).toBeUndefined();
  });
});

describe('Permission Lifecycle', () => {
  let permRoleId: string;
  let permId: string;

  it('should create a permission and verify in DB', async () => {
    const role = await service.createRole({ name: 'Perm Role' }, TEST_TENANT_ID, TEST_USER_ID);
    permRoleId = role.id;
    const perm = await service.createPermission({ roleId: permRoleId, resource: 'invoices', action: 'read' }, TEST_TENANT_ID, TEST_USER_ID);
    permId = perm.id;
    expect(perm.resource).toBe('invoices');
    const dbRow = await findPermissionById(perm.id);
    expect(dbRow).toBeDefined();
  });

  it('should get a permission by id', async () => {
    const perm = await service.getPermission(permId, TEST_TENANT_ID);
    expect(perm.id).toBe(permId);
  });

  it('should list permissions for a role', async () => {
    const result = await service.listPermissions(TEST_TENANT_ID, { page: 1, limit: 50, roleId: permRoleId });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should hard delete a permission', async () => {
    await service.deletePermission(permId, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findPermissionById(permId);
    expect(dbRow).toBeUndefined();
  });
});

describe('Duplicate Permission', () => {
  it('should throw DuplicatePermissionError when creating same permission twice', async () => {
    const role = await service.createRole({ name: 'Dup Perm Role' }, TEST_TENANT_ID, TEST_USER_ID);
    await service.createPermission({ roleId: role.id, resource: 'items', action: 'write' }, TEST_TENANT_ID, TEST_USER_ID);
    await expect(
      service.createPermission({ roleId: role.id, resource: 'items', action: 'write' }, TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow(DuplicatePermissionError);
  });
});

describe('Session Management', () => {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
  let sessionUserId: string;
  let sessionId1: string;
  let sessionId2: string;

  it('should create sessions directly in DB and list them', async () => {
    const user = await service.createUser({ email: 'sess@example.com', name: 'Sess', username: 'sessuser' }, TEST_TENANT_ID, TEST_USER_ID);
    sessionUserId = user.id;
    const [s1] = await testDb.insert(sessions).values({ userId: sessionUserId, token: 'aaa-111', expiresAt: futureDate, tenantId: TEST_TENANT_ID }).returning();
    sessionId1 = s1.id;
    const [s2] = await testDb.insert(sessions).values({ userId: sessionUserId, token: 'bbb-222', expiresAt: futureDate, tenantId: TEST_TENANT_ID }).returning();
    sessionId2 = s2.id;
    const result = await service.listSessions(TEST_TENANT_ID, { page: 1, limit: 50 });
    expect(result.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should revoke a single session', async () => {
    await service.invalidateSession(sessionId1, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findSessionById(sessionId1);
    expect(dbRow!.deletedAt).not.toBeNull();
  });

  it('should revoke all sessions for a user', async () => {
    await service.invalidateAllUserSessions(sessionUserId, TEST_TENANT_ID, TEST_USER_ID);
    const dbRow = await findSessionById(sessionId2);
    expect(dbRow!.deletedAt).not.toBeNull();
  });
});

describe('Tenant Isolation', () => {
  let tenantAUserId: string;
  let tenantARoleId: string;

  it('should scope user operations to tenant', async () => {
    const userA = await service.createUser({ email: 'ta@example.com', name: 'TA', username: 'ta' }, TEST_TENANT_ID, TEST_USER_ID);
    tenantAUserId = userA.id;
    await service.createUser({ email: 'tb@example.com', name: 'TB', username: 'tb' }, OTHER_TENANT_ID, TEST_USER_ID);
    const result = await service.listUsers(TEST_TENANT_ID, { page: 1, limit: 50 });
    expect(result.data.some((u) => u.email === 'ta@example.com')).toBe(true);
    expect(result.data.some((u) => u.email === 'tb@example.com')).toBe(false);
    await expect(service.getUser(tenantAUserId, OTHER_TENANT_ID)).rejects.toThrow(UserNotFoundError);
  });

  it('should scope role operations to tenant', async () => {
    const roleA = await service.createRole({ name: 'Tenant A Role' }, TEST_TENANT_ID, TEST_USER_ID);
    tenantARoleId = roleA.id;
    await service.createRole({ name: 'Tenant B Role' }, OTHER_TENANT_ID, TEST_USER_ID);
    const result = await service.listRoles(TEST_TENANT_ID, { page: 1, limit: 50 });
    expect(result.data.some((r) => r.name === 'Tenant A Role')).toBe(true);
    await expect(service.getRole(tenantARoleId, OTHER_TENANT_ID)).rejects.toThrow(RoleNotFoundError);
  });

  it('should scope user-role assignments across tenants', async () => {
    const assignment = await service.assignRole(tenantAUserId, tenantARoleId, TEST_TENANT_ID, TEST_USER_ID);
    expect(assignment).toBeDefined();
    const list = await service.listUserRoles(tenantAUserId, TEST_TENANT_ID);
    expect(list.some((ur) => ur.roleId === tenantARoleId)).toBe(true);
  });

  it('should scope permission operations to tenant', async () => {
    const perm = await service.createPermission({ roleId: tenantARoleId, resource: 'reports', action: 'read' }, TEST_TENANT_ID, TEST_USER_ID);
    const found = await service.getPermission(perm.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    await expect(service.getPermission(perm.id, OTHER_TENANT_ID)).rejects.toThrow();
  });

  it('should not find soft-deleted users in other tenant lookups', async () => {
    const user = await service.createUser({ email: 'del@example.com', name: 'Del', username: 'del' }, TEST_TENANT_ID, TEST_USER_ID);
    await service.deleteUser(user.id, TEST_TENANT_ID, TEST_USER_ID);
    await expect(service.getUser(user.id, TEST_TENANT_ID)).rejects.toThrow(UserNotFoundError);
  });
});
