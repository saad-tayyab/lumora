vi.mock('../../database', () => ({
  db: testDb,
}));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: vi.fn(),
}));

vi.mock('encore.dev/api', () => ({
  api: vi.fn(() => (fn: unknown) => fn),
}));

import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { testDb, TEST_TENANT_ID } from '../../lib/integration-test-utils';
import { users, roles, userRoles, permissions, sessions } from '@lumora/database/schema';
import { usersRepo, rolesRepo, userRolesRepo, permissionsRepo, sessionsRepo } from './repo';
import { eq } from 'drizzle-orm';

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

let testUserId: string;
let testRoleId: string;
let testRoleId2: string;

async function cleanupAuthTestData(): Promise<void> {
  await testDb.delete(sessions).where(eq(sessions.tenantId, TEST_TENANT_ID));
  await testDb.delete(sessions).where(eq(sessions.tenantId, OTHER_TENANT_ID));
  await testDb.delete(userRoles);
  await testDb.delete(permissions).where(eq(permissions.tenantId, TEST_TENANT_ID));
  await testDb.delete(permissions).where(eq(permissions.tenantId, OTHER_TENANT_ID));
  await testDb.delete(users).where(eq(users.tenantId, TEST_TENANT_ID));
  await testDb.delete(users).where(eq(users.tenantId, OTHER_TENANT_ID));
  await testDb.delete(roles).where(eq(roles.tenantId, TEST_TENANT_ID));
  await testDb.delete(roles).where(eq(roles.tenantId, OTHER_TENANT_ID));
}

beforeAll(async () => {
  await cleanupAuthTestData();
});

afterAll(async () => {
  await cleanupAuthTestData();
});

// ─── usersRepo ──────────────────────────────────────────────────────────────

describe('usersRepo', () => {
  describe('create', () => {
    it('should create a user with all required fields', async () => {
      const user = await usersRepo.create({
        email: 'alice@example.com',
        name: 'Alice',
        username: 'alice',
        tenantId: TEST_TENANT_ID,
      });

      testUserId = user.id;
      expect(user).toBeDefined();
      expect(user.email).toBe('alice@example.com');
      expect(user.name).toBe('Alice');
      expect(user.username).toBe('alice');
      expect(user.tenantId).toBe(TEST_TENANT_ID);
      expect(user.status).toBe('active');
      expect(user.emailVerified).toBe(false);
      expect(user.mfaEnabled).toBe(false);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.deletedAt).toBeNull();
    });

    it('should create a user with custom status', async () => {
      const user = await usersRepo.create({
        email: 'bob@example.com',
        name: 'Bob',
        username: 'bob',
        status: 'inactive',
        tenantId: TEST_TENANT_ID,
      });

      expect(user.status).toBe('inactive');
    });

    it('should enforce unique email constraint', async () => {
      await expect(
        usersRepo.create({
          email: 'alice@example.com',
          name: 'Alice Duplicate',
          username: 'alice-dup',
          tenantId: TEST_TENANT_ID,
        }),
      ).rejects.toThrow();
    });

    it('should enforce unique username constraint', async () => {
      await expect(
        usersRepo.create({
          email: 'unique@example.com',
          name: 'Alice Username',
          username: 'alice',
          tenantId: TEST_TENANT_ID,
        }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return a user by id and tenantId', async () => {
      const user = await usersRepo.findById(testUserId, TEST_TENANT_ID);
      expect(user).toBeDefined();
      expect(user!.id).toBe(testUserId);
      expect(user!.email).toBe('alice@example.com');
    });

    it('should return undefined for non-existent id', async () => {
      const user = await usersRepo.findById(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(user).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      const user = await usersRepo.findById(testUserId, OTHER_TENANT_ID);
      expect(user).toBeUndefined();
    });

    it('should not return soft-deleted users', async () => {
      await usersRepo.softDelete(testUserId, TEST_TENANT_ID);
      const user = await usersRepo.findById(testUserId, TEST_TENANT_ID);
      expect(user).toBeUndefined();

      // Re-create for subsequent tests
      const recreated = await usersRepo.create({
        email: 'alice@example.com',
        name: 'Alice',
        username: 'alice',
        tenantId: TEST_TENANT_ID,
      });
      testUserId = recreated.id;
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = await usersRepo.findByEmail('alice@example.com', TEST_TENANT_ID);
      expect(user).toBeDefined();
      expect(user!.id).toBe(testUserId);
    });

    it('should return undefined for non-existent email', async () => {
      const user = await usersRepo.findByEmail('nonexistent@example.com', TEST_TENANT_ID);
      expect(user).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      const user = await usersRepo.findByEmail('alice@example.com', OTHER_TENANT_ID);
      expect(user).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user = await usersRepo.findByUsername('alice', TEST_TENANT_ID);
      expect(user).toBeDefined();
      expect(user!.id).toBe(testUserId);
    });

    it('should return undefined for non-existent username', async () => {
      const user = await usersRepo.findByUsername('nonexistent', TEST_TENANT_ID);
      expect(user).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('should return all users with total count', async () => {
      const { data, total } = await usersRepo.findMany(TEST_TENANT_ID);
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      await usersRepo.create({
        email: 'inactive@example.com',
        name: 'Inactive',
        username: 'inactive',
        status: 'inactive',
        tenantId: TEST_TENANT_ID,
      });

      const { data, total } = await usersRepo.findMany(TEST_TENANT_ID, {
        status: 'inactive',
      });
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(total).toBeGreaterThanOrEqual(1);
      expect(data.every((u) => u.status === 'inactive')).toBe(true);
    });

    it('should respect limit', async () => {
      const { data } = await usersRepo.findMany(TEST_TENANT_ID, { limit: 1 });
      expect(data.length).toBe(1);
    });

    it('should respect offset', async () => {
      const all = await usersRepo.findMany(TEST_TENANT_ID, { limit: 100 });
      const { data } = await usersRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });
      expect(data.length).toBe(1);
      expect(data[0].id).not.toBe(all.data[0].id);
    });

    it('should not return soft-deleted users', async () => {
      const temp = await usersRepo.create({
        email: 'temp-findmany@example.com',
        name: 'Temp',
        username: 'temp-findmany',
        tenantId: TEST_TENANT_ID,
      });
      await usersRepo.softDelete(temp.id, TEST_TENANT_ID);

      const { data } = await usersRepo.findMany(TEST_TENANT_ID);
      expect(data.find((u) => u.id === temp.id)).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      await usersRepo.create({
        email: 'other@example.com',
        name: 'Other',
        username: 'other',
        tenantId: OTHER_TENANT_ID,
      });

      const { data } = await usersRepo.findMany(TEST_TENANT_ID);
      expect(data.find((u) => u.email === 'other@example.com')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const updated = await usersRepo.update(testUserId, TEST_TENANT_ID, {
        name: 'Alice Updated',
        email: 'alice-updated@example.com',
      });
      expect(updated.name).toBe('Alice Updated');
      expect(updated.email).toBe('alice-updated@example.com');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(updated.createdAt.getTime());
    });

    it('should update status', async () => {
      const updated = await usersRepo.update(testUserId, TEST_TENANT_ID, {
        status: 'suspended',
      });
      expect(updated.status).toBe('suspended');

      // Restore
      await usersRepo.update(testUserId, TEST_TENANT_ID, { status: 'active' });
    });

    it('should not update soft-deleted users', async () => {
      const temp = await usersRepo.create({
        email: 'temp-update@example.com',
        name: 'Temp',
        username: 'temp-update',
        tenantId: TEST_TENANT_ID,
      });
      await usersRepo.softDelete(temp.id, TEST_TENANT_ID);

      await expect(
        usersRepo.update(temp.id, TEST_TENANT_ID, { name: 'Should Not Work' }),
      ).rejects.toThrow();
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt on the user', async () => {
      const temp = await usersRepo.create({
        email: 'temp-softdel@example.com',
        name: 'Temp',
        username: 'temp-softdel',
        tenantId: TEST_TENANT_ID,
      });
      await usersRepo.softDelete(temp.id, TEST_TENANT_ID);

      const found = await testDb.query.users.findFirst({
        where: eq(users.id, temp.id),
      });
      expect(found).toBeDefined();
      expect(found!.deletedAt).not.toBeNull();
    });
  });

  describe('countByTenantId', () => {
    it('should count non-deleted users for tenant', async () => {
      const count = await usersRepo.countByTenantId(TEST_TENANT_ID);
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should not count soft-deleted users', async () => {
      const temp = await usersRepo.create({
        email: 'temp-count@example.com',
        name: 'Temp',
        username: 'temp-count',
        tenantId: TEST_TENANT_ID,
      });
      const before = await usersRepo.countByTenantId(TEST_TENANT_ID);
      await usersRepo.softDelete(temp.id, TEST_TENANT_ID);
      const after = await usersRepo.countByTenantId(TEST_TENANT_ID);
      expect(after).toBe(before - 1);
    });

    it('should return 0 for tenant with no users', async () => {
      const count = await usersRepo.countByTenantId(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(count).toBe(0);
    });
  });
});

// ─── rolesRepo ──────────────────────────────────────────────────────────────

describe('rolesRepo', () => {
  describe('create', () => {
    it('should create a role with all fields', async () => {
      const role = await rolesRepo.create({
        name: 'Admin',
        description: 'Full access',
        isSystem: true,
        tenantId: TEST_TENANT_ID,
      });

      testRoleId = role.id;
      expect(role).toBeDefined();
      expect(role.name).toBe('Admin');
      expect(role.description).toBe('Full access');
      expect(role.isSystem).toBe(true);
      expect(role.tenantId).toBe(TEST_TENANT_ID);
      expect(role.id).toBeDefined();
    });

    it('should create a role with defaults', async () => {
      const role = await rolesRepo.create({
        name: 'Viewer',
        tenantId: TEST_TENANT_ID,
      });

      testRoleId2 = role.id;
      expect(role.description).toBeNull();
      expect(role.isSystem).toBe(false);
    });

    it('should enforce unique role name per tenant', async () => {
      await expect(
        rolesRepo.create({
          name: 'Admin',
          tenantId: TEST_TENANT_ID,
        }),
      ).rejects.toThrow();
    });

    it('should allow same role name in different tenants', async () => {
      const role = await rolesRepo.create({
        name: 'Admin',
        tenantId: OTHER_TENANT_ID,
      });
      expect(role).toBeDefined();
      expect(role.name).toBe('Admin');
      expect(role.tenantId).toBe(OTHER_TENANT_ID);
    });
  });

  describe('findById', () => {
    it('should return a role by id and tenantId', async () => {
      const role = await rolesRepo.findById(testRoleId, TEST_TENANT_ID);
      expect(role).toBeDefined();
      expect(role!.id).toBe(testRoleId);
      expect(role!.name).toBe('Admin');
    });

    it('should return undefined for non-existent id', async () => {
      const role = await rolesRepo.findById(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(role).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      const role = await rolesRepo.findById(testRoleId, OTHER_TENANT_ID);
      expect(role).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should return a role by name', async () => {
      const role = await rolesRepo.findByName('Admin', TEST_TENANT_ID);
      expect(role).toBeDefined();
      expect(role!.id).toBe(testRoleId);
    });

    it('should return undefined for non-existent name', async () => {
      const role = await rolesRepo.findByName('Nonexistent', TEST_TENANT_ID);
      expect(role).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('should return all roles with total count', async () => {
      const { data, total } = await rolesRepo.findMany(TEST_TENANT_ID);
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit', async () => {
      const { data } = await rolesRepo.findMany(TEST_TENANT_ID, { limit: 1 });
      expect(data.length).toBe(1);
    });

    it('should respect offset', async () => {
      const all = await rolesRepo.findMany(TEST_TENANT_ID, { limit: 100 });
      const { data } = await rolesRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });
      expect(data.length).toBe(1);
      expect(data[0].id).not.toBe(all.data[0].id);
    });

    it('should not return soft-deleted roles', async () => {
      const temp = await rolesRepo.create({
        name: 'TempRole',
        tenantId: TEST_TENANT_ID,
      });
      await rolesRepo.softDelete(temp.id, TEST_TENANT_ID);

      const { data } = await rolesRepo.findMany(TEST_TENANT_ID);
      expect(data.find((r) => r.id === temp.id)).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update role fields', async () => {
      const updated = await rolesRepo.update(testRoleId, TEST_TENANT_ID, {
        name: 'Super Admin',
        description: 'Full system access',
      });
      expect(updated.name).toBe('Super Admin');
      expect(updated.description).toBe('Full system access');
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt on the role', async () => {
      const temp = await rolesRepo.create({
        name: 'TempRoleDel',
        tenantId: TEST_TENANT_ID,
      });
      await rolesRepo.softDelete(temp.id, TEST_TENANT_ID);

      const found = await testDb.query.roles.findFirst({
        where: eq(roles.id, temp.id),
      });
      expect(found).toBeDefined();
      expect(found!.deletedAt).not.toBeNull();
    });
  });
});

// ─── userRolesRepo ──────────────────────────────────────────────────────────

describe('userRolesRepo', () => {
  describe('assign', () => {
    it('should assign a role to a user', async () => {
      const assignment = await userRolesRepo.assign({
        userId: testUserId,
        roleId: testRoleId,
      });
      expect(assignment).toBeDefined();
      expect(assignment.userId).toBe(testUserId);
      expect(assignment.roleId).toBe(testRoleId);
    });

    it('should enforce unique user-role constraint', async () => {
      await expect(
        userRolesRepo.assign({
          userId: testUserId,
          roleId: testRoleId,
        }),
      ).rejects.toThrow();
    });
  });

  describe('findByUserAndRole', () => {
    it('should find an existing assignment', async () => {
      const assignment = await userRolesRepo.findByUserAndRole(testUserId, testRoleId);
      expect(assignment).toBeDefined();
      expect(assignment!.userId).toBe(testUserId);
      expect(assignment!.roleId).toBe(testRoleId);
    });

    it('should return undefined for non-existent assignment', async () => {
      const assignment = await userRolesRepo.findByUserAndRole(
        '00000000-0000-0000-0000-000000000000',
        testRoleId,
      );
      expect(assignment).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should return all roles for a user', async () => {
      await userRolesRepo.assign({
        userId: testUserId,
        roleId: testRoleId2,
      });

      const assignments = await userRolesRepo.findByUserId(testUserId);
      expect(assignments.length).toBe(2);
      const roleIds = assignments.map((a) => a.roleId);
      expect(roleIds).toContain(testRoleId);
      expect(roleIds).toContain(testRoleId2);
    });

    it('should return empty array for user with no roles', async () => {
      const assignments = await userRolesRepo.findByUserId(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(assignments).toEqual([]);
    });
  });

  describe('findByRoleId', () => {
    it('should return all users with a given role', async () => {
      const assignments = await userRolesRepo.findByRoleId(testRoleId);
      expect(assignments.length).toBeGreaterThanOrEqual(1);
      expect(assignments.some((a) => a.userId === testUserId)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a specific user-role assignment', async () => {
      await userRolesRepo.remove(testUserId, testRoleId2);

      const assignment = await userRolesRepo.findByUserAndRole(testUserId, testRoleId2);
      expect(assignment).toBeUndefined();

      // Re-assign for other tests
      await userRolesRepo.assign({
        userId: testUserId,
        roleId: testRoleId2,
      });
    });

    it('should be idempotent when removing non-existent assignment', async () => {
      await expect(
        userRolesRepo.remove(
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000000',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('removeAllForUser', () => {
    it('should remove all roles for a user', async () => {
      await userRolesRepo.removeAllForUser(testUserId);
      const assignments = await userRolesRepo.findByUserId(testUserId);
      expect(assignments).toEqual([]);
    });
  });
});

// ─── permissionsRepo ────────────────────────────────────────────────────────

describe('permissionsRepo', () => {
  let testPermissionId: string;
  let testPermissionId2: string;

  describe('create', () => {
    it('should create a permission', async () => {
      const perm = await permissionsRepo.create({
        roleId: testRoleId,
        resource: 'invoices',
        action: 'read',
        tenantId: TEST_TENANT_ID,
      });
      testPermissionId = perm.id;
      expect(perm).toBeDefined();
      expect(perm.roleId).toBe(testRoleId);
      expect(perm.resource).toBe('invoices');
      expect(perm.action).toBe('read');
      expect(perm.tenantId).toBe(TEST_TENANT_ID);
    });

    it('should create another permission for pagination tests', async () => {
      const perm = await permissionsRepo.create({
        roleId: testRoleId,
        resource: 'invoices',
        action: 'write',
        tenantId: TEST_TENANT_ID,
      });
      testPermissionId2 = perm.id;
      expect(perm).toBeDefined();
    });

    it('should enforce unique roleId-resource-action constraint', async () => {
      await expect(
        permissionsRepo.create({
          roleId: testRoleId,
          resource: 'invoices',
          action: 'read',
          tenantId: TEST_TENANT_ID,
        }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return a permission by id', async () => {
      const perm = await permissionsRepo.findById(testPermissionId, TEST_TENANT_ID);
      expect(perm).toBeDefined();
      expect(perm!.id).toBe(testPermissionId);
    });

    it('should return undefined for non-existent id', async () => {
      const perm = await permissionsRepo.findById(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(perm).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      const perm = await permissionsRepo.findById(testPermissionId, OTHER_TENANT_ID);
      expect(perm).toBeUndefined();
    });
  });

  describe('findByRoleId', () => {
    it('should return all permissions for a role', async () => {
      const perms = await permissionsRepo.findByRoleId(testRoleId, TEST_TENANT_ID);
      expect(perms.length).toBeGreaterThanOrEqual(2);
      expect(perms.every((p) => p.roleId === testRoleId)).toBe(true);
    });

    it('should return empty array for role with no permissions', async () => {
      const perms = await permissionsRepo.findByRoleId(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(perms).toEqual([]);
    });
  });

  describe('findByRoleAndResource', () => {
    it('should find a specific permission by role and resource', async () => {
      const perm = await permissionsRepo.findByRoleAndResource(
        testRoleId,
        'invoices',
        'read',
        TEST_TENANT_ID,
      );
      expect(perm).toBeDefined();
      expect(perm!.id).toBe(testPermissionId);
    });

    it('should return undefined for non-existent combination', async () => {
      const perm = await permissionsRepo.findByRoleAndResource(
        testRoleId,
        'invoices',
        'delete',
        TEST_TENANT_ID,
      );
      expect(perm).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('should return all permissions with total count', async () => {
      const { data, total } = await permissionsRepo.findMany(TEST_TENANT_ID);
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit', async () => {
      const { data } = await permissionsRepo.findMany(TEST_TENANT_ID, { limit: 1 });
      expect(data.length).toBe(1);
    });

    it('should respect offset', async () => {
      const all = await permissionsRepo.findMany(TEST_TENANT_ID, { limit: 100 });
      const { data } = await permissionsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });
      expect(data.length).toBe(1);
      expect(data[0].id).not.toBe(all.data[0].id);
    });
  });

  describe('delete', () => {
    it('should hard delete a permission', async () => {
      const perm = await permissionsRepo.create({
        roleId: testRoleId2,
        resource: 'reports',
        action: 'read',
        tenantId: TEST_TENANT_ID,
      });

      await permissionsRepo.delete(perm.id, TEST_TENANT_ID);

      const found = await permissionsRepo.findById(perm.id, TEST_TENANT_ID);
      expect(found).toBeUndefined();
    });

    it('should not affect permissions in other tenants', async () => {
      const perm = await permissionsRepo.create({
        roleId: testRoleId,
        resource: 'users',
        action: 'read',
        tenantId: OTHER_TENANT_ID,
      });

      await permissionsRepo.delete(perm.id, OTHER_TENANT_ID);

      const found = await permissionsRepo.findById(perm.id, OTHER_TENANT_ID);
      expect(found).toBeUndefined();
    });
  });

  describe('deleteByRoleId', () => {
    it('should hard delete all permissions for a role in a tenant', async () => {
      const tempRole = await rolesRepo.create({
        name: 'TempPermRole',
        tenantId: TEST_TENANT_ID,
      });

      await permissionsRepo.create({
        roleId: tempRole.id,
        resource: 'items',
        action: 'read',
        tenantId: TEST_TENANT_ID,
      });
      await permissionsRepo.create({
        roleId: tempRole.id,
        resource: 'items',
        action: 'write',
        tenantId: TEST_TENANT_ID,
      });

      const before = await permissionsRepo.findByRoleId(tempRole.id, TEST_TENANT_ID);
      expect(before.length).toBe(2);

      await permissionsRepo.deleteByRoleId(tempRole.id, TEST_TENANT_ID);

      const after = await permissionsRepo.findByRoleId(tempRole.id, TEST_TENANT_ID);
      expect(after.length).toBe(0);
    });
  });
});

// ─── sessionsRepo ───────────────────────────────────────────────────────────

describe('sessionsRepo', () => {
  let testSessionId: string;
  let testSessionId2: string;

  const futureDate = new Date(Date.now() + 1000 * 60 * 60);

  describe('create + findById', () => {
    it('should create and find a session by id', async () => {
      const [session] = await testDb
        .insert(sessions)
        .values({
          userId: testUserId,
          token: 'session-token-abc-123',
          expiresAt: futureDate,
          tenantId: TEST_TENANT_ID,
        })
        .returning();

      testSessionId = session.id;
      const found = await sessionsRepo.findById(testSessionId, TEST_TENANT_ID);
      expect(found).toBeDefined();
      expect(found!.id).toBe(testSessionId);
      expect(found!.token).toBe('session-token-abc-123');
      expect(found!.userId).toBe(testUserId);
    });

    it('should return undefined for non-existent session', async () => {
      const found = await sessionsRepo.findById(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(found).toBeUndefined();
    });

    it('should enforce tenant isolation', async () => {
      const found = await sessionsRepo.findById(testSessionId, OTHER_TENANT_ID);
      expect(found).toBeUndefined();
    });
  });

  describe('findByToken', () => {
    it('should find a session by token', async () => {
      const found = await sessionsRepo.findByToken('session-token-abc-123', TEST_TENANT_ID);
      expect(found).toBeDefined();
      expect(found!.id).toBe(testSessionId);
    });

    it('should return undefined for non-existent token', async () => {
      const found = await sessionsRepo.findByToken('non-existent-token', TEST_TENANT_ID);
      expect(found).toBeUndefined();
    });
  });

  describe('findManyByUserId', () => {
    it('should return all sessions for a user', async () => {
      const [session2] = await testDb
        .insert(sessions)
        .values({
          userId: testUserId,
          token: 'session-token-def-456',
          expiresAt: futureDate,
          tenantId: TEST_TENANT_ID,
        })
        .returning();

      testSessionId2 = session2.id;

      const found = await sessionsRepo.findManyByUserId(testUserId, TEST_TENANT_ID);
      expect(found.length).toBeGreaterThanOrEqual(2);
      expect(found.every((s) => s.userId === testUserId)).toBe(true);
    });

    it('should return empty array for user with no sessions', async () => {
      const found = await sessionsRepo.findManyByUserId(
        '00000000-0000-0000-0000-000000000000',
        TEST_TENANT_ID,
      );
      expect(found).toEqual([]);
    });

    it('should not return soft-deleted sessions', async () => {
      const [tempSession] = await testDb
        .insert(sessions)
        .values({
          userId: testUserId,
          token: 'session-token-temp-789',
          expiresAt: futureDate,
          tenantId: TEST_TENANT_ID,
        })
        .returning();

      await sessionsRepo.softDelete(tempSession.id, TEST_TENANT_ID);

      const found = await sessionsRepo.findManyByUserId(testUserId, TEST_TENANT_ID);
      expect(found.find((s) => s.id === tempSession.id)).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('should return all sessions with total count', async () => {
      const { data, total } = await sessionsRepo.findMany(TEST_TENANT_ID);
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit', async () => {
      const { data } = await sessionsRepo.findMany(TEST_TENANT_ID, { limit: 1 });
      expect(data.length).toBe(1);
    });

    it('should respect offset', async () => {
      const all = await sessionsRepo.findMany(TEST_TENANT_ID, { limit: 100 });
      const { data } = await sessionsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });
      expect(data.length).toBe(1);
      expect(data[0].id).not.toBe(all.data[0].id);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt on the session', async () => {
      await sessionsRepo.softDelete(testSessionId, TEST_TENANT_ID);

      const found = await testDb.query.sessions.findFirst({
        where: eq(sessions.id, testSessionId),
      });
      expect(found).toBeDefined();
      expect(found!.deletedAt).not.toBeNull();
    });

    it('should not return soft-deleted session in findById', async () => {
      const found = await sessionsRepo.findById(testSessionId, TEST_TENANT_ID);
      expect(found).toBeUndefined();
    });
  });

  describe('deleteAllForUser', () => {
    it('should soft delete all sessions for a user in a tenant', async () => {
      // Create remaining session for the user
      const [freshSession] = await testDb
        .insert(sessions)
        .values({
          userId: testUserId,
          token: 'session-token-delete-all-001',
          expiresAt: futureDate,
          tenantId: TEST_TENANT_ID,
        })
        .returning();

      const before = await sessionsRepo.findManyByUserId(testUserId, TEST_TENANT_ID);
      expect(before.length).toBeGreaterThanOrEqual(1);

      await sessionsRepo.deleteAllForUser(testUserId, TEST_TENANT_ID);

      const after = await sessionsRepo.findManyByUserId(testUserId, TEST_TENANT_ID);
      expect(after.length).toBe(0);

      // Verify sessions exist but are soft-deleted
      const raw = await testDb.query.sessions.findFirst({
        where: eq(sessions.id, freshSession.id),
      });
      expect(raw).toBeDefined();
      expect(raw!.deletedAt).not.toBeNull();
    });

    it('should not affect sessions in other tenants', async () => {
      const [otherSession] = await testDb
        .insert(sessions)
        .values({
          userId: testUserId,
          token: 'session-token-other-tenant-001',
          expiresAt: futureDate,
          tenantId: OTHER_TENANT_ID,
        })
        .returning();

      await sessionsRepo.deleteAllForUser(testUserId, OTHER_TENANT_ID);

      const found = await testDb.query.sessions.findFirst({
        where: eq(sessions.id, otherSession.id),
      });
      expect(found).toBeDefined();
      expect(found!.deletedAt).not.toBeNull();
    });
  });
});
