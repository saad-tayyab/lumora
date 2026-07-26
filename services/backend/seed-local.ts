import { randomBytes, scryptSync } from 'node:crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, roles, userRoles, permissions, account } from '@lumora/database/schema';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password.normalize('NFKC'), salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 1024 * 1024 });
  return `${salt}:${key.toString('hex')}`;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required. Run: DATABASE_URL=$(encore db conn-uri lumora) bun seed-local.ts');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ─── Constants ────────────────────────────────────────────────────────────────
const T = '00000000-0000-0000-0000-000000000001';
const ADMIN = '00000000-0000-0000-0000-000000000002';
const MANAGER = '00000000-0000-0000-0000-000000000003';
const USER = '00000000-0000-0000-0000-000000000004';
const DEV = '00000000-0000-0000-0000-000000000005';
const ROLE_ADMIN = '00000000-0000-0000-0000-000000000010';
const ROLE_MGR = '00000000-0000-0000-0000-000000000011';
const ROLE_USER = '00000000-0000-0000-0000-000000000012';
const UR_1 = '00000000-0000-0000-0000-000000000030';
const UR_2 = '00000000-0000-0000-0000-000000000031';
const UR_3 = '00000000-0000-0000-0000-000000000032';
const PERM_1 = '00000000-0000-0000-0000-000000000050';
const PERM_2 = '00000000-0000-0000-0000-000000000051';
const PERM_3 = '00000000-0000-0000-0000-000000000052';
const PERM_4 = '00000000-0000-0000-0000-000000000053';
const PERM_5 = '00000000-0000-0000-0000-000000000054';
const PERM_6 = '00000000-0000-0000-0000-000000000055';
const PERM_7 = '00000000-0000-0000-0000-000000000056';
const PERM_8 = '00000000-0000-0000-0000-000000000057';
const PERM_9 = '00000000-0000-0000-0000-000000000058';
const DEV_ACCOUNT = '00000000-0000-0000-0000-000000000040';
const DEV_PASSWORD_HASH = hashPassword('123456');

async function seed() {
  console.log('Seeding local database...');

  // Roles
  await db.insert(roles).values([
    { id: ROLE_ADMIN, tenantId: T, name: 'Admin', description: 'Full system administrator', isSystem: true },
    { id: ROLE_MGR, tenantId: T, name: 'Manager', description: 'Department manager', isSystem: true },
    { id: ROLE_USER, tenantId: T, name: 'User', description: 'Standard user', isSystem: true },
  ]).onConflictDoNothing();
  console.log('  Roles: Admin, Manager, User');

  // Users
  await db.insert(users).values([
    { id: ADMIN, tenantId: T, email: 'admin@lumora.app', name: 'System Admin', username: 'admin', status: 'active', emailVerified: true },
    { id: MANAGER, tenantId: T, email: 'manager@lumora.app', name: 'Jane Manager', username: 'jane.manager', status: 'active', emailVerified: true },
    { id: USER, tenantId: T, email: 'user@lumora.app', name: 'John User', username: 'john.user', status: 'active', emailVerified: true },
    { id: DEV, tenantId: T, email: 'dev@lumora.app', name: 'Dev User', username: 'dev', status: 'active', emailVerified: true },
  ]).onConflictDoNothing();
  console.log('  Users: admin@lumora.app, manager@lumora.app, user@lumora.app, dev@lumora.app');

  // User Roles
  await db.insert(userRoles).values([
    { id: UR_1, userId: ADMIN, roleId: ROLE_ADMIN },
    { id: UR_2, userId: MANAGER, roleId: ROLE_MGR },
    { id: UR_3, userId: USER, roleId: ROLE_USER },
    { id: '00000000-0000-0000-0000-000000000033', userId: DEV, roleId: ROLE_ADMIN },
  ]).onConflictDoNothing();
  console.log('  User roles assigned');

  // Account (Better Auth password storage)
  await db.insert(account).values({
    id: DEV_ACCOUNT,
    accountId: 'dev@lumora.app',
    providerId: 'credential',
    userId: DEV,
    password: DEV_PASSWORD_HASH,
  }).onConflictDoNothing();
  console.log('  Account: dev@lumora.app / 123456');

  // Permissions
  await db.insert(permissions).values([
    { id: PERM_1, tenantId: T, roleId: ROLE_ADMIN, resource: '*', action: '*' },
    { id: PERM_2, tenantId: T, roleId: ROLE_MGR, resource: 'invoices', action: 'create' },
    { id: PERM_3, tenantId: T, roleId: ROLE_MGR, resource: 'invoices', action: 'read' },
    { id: PERM_4, tenantId: T, roleId: ROLE_MGR, resource: 'invoices', action: 'update' },
    { id: PERM_5, tenantId: T, roleId: ROLE_MGR, resource: 'reports', action: 'read' },
    { id: PERM_6, tenantId: T, roleId: ROLE_USER, resource: 'invoices', action: 'read' },
    { id: PERM_7, tenantId: T, roleId: ROLE_USER, resource: 'reports', action: 'read' },
    { id: PERM_8, tenantId: T, roleId: ROLE_USER, resource: 'items', action: 'read' },
    { id: PERM_9, tenantId: T, roleId: ROLE_USER, resource: 'items', action: 'update' },
  ]).onConflictDoNothing();
  console.log('  Permissions: 9 permission rules');

  console.log('Seeding complete!');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
