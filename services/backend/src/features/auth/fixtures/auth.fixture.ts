import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── User Fixtures ──────────────────────────────────────────────────────────

export const createUserFixture = (overrides = {}) => ({
  id: 'user-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  email: 'john.doe@example.com',
  name: 'John Doe',
  username: 'johndoe',
  status: 'active' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createSuspendedUserFixture = (overrides = {}) =>
  createUserFixture({ status: 'suspended' as const, ...overrides });

// ─── Role Fixtures ──────────────────────────────────────────────────────────

export const createRoleFixture = (overrides = {}) => ({
  id: 'role-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Admin',
  description: 'System administrator role',
  isSystem: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createSystemRoleFixture = (overrides = {}) =>
  createRoleFixture({ isSystem: true, name: 'System Admin', ...overrides });

// ─── Permission Fixtures ────────────────────────────────────────────────────

export const createPermissionFixture = (overrides = {}) => ({
  id: 'perm-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  roleId: 'role-00000000-0000-0000-000000000001',
  resource: 'invoice',
  action: 'create',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

// ─── User Role Fixtures ─────────────────────────────────────────────────────

export const createUserRoleFixture = (overrides = {}) => ({
  id: 'ur-00000000-0000-0000-000000000001',
  userId: 'user-00000000-0000-0000-000000000001',
  roleId: 'role-00000000-0000-0000-000000000001',
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

// ─── Session Fixtures ───────────────────────────────────────────────────────

export const createSessionFixture = (overrides = {}) => ({
  id: 'sess-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  userId: 'user-00000000-0000-0000-000000000001',
  token: 'session-token-abc123',
  expiresAt: new Date('2026-12-31'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Audit Log Fixtures ─────────────────────────────────────────────────────

export const createAuditLogFixture = (overrides = {}) => ({
  id: 'audit-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  userId: TEST_USER_ID,
  action: 'USER_CREATED',
  resource: 'user',
  resourceId: 'user-00000000-0000-0000-000000000001',
  metadata: { email: 'john.doe@example.com' },
  ipAddress: '127.0.0.1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

// ─── Input Fixtures ─────────────────────────────────────────────────────────

export const createUserInputFixture = (overrides = {}) => ({
  email: 'john.doe@example.com',
  name: 'John Doe',
  username: 'johndoe',
  status: 'active' as const,
  ...overrides,
});

export const createRoleInputFixture = (overrides = {}) => ({
  name: 'Admin',
  description: 'System administrator role',
  isSystem: false,
  ...overrides,
});

export const createPermissionInputFixture = (overrides = {}) => ({
  roleId: 'role-00000000-0000-0000-000000000001',
  resource: 'invoice',
  action: 'create',
  ...overrides,
});
