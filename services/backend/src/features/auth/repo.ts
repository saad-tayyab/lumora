import {
  type Permission,
  permissions,
  type Role,
  roles,
  type Session,
  sessions,
  type User,
  type UserRole,
  userRoles,
  users,
} from '@lumora/database/schema';
import { and, asc, count, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// ─── Users Repository ───────────────────────────────────────────────────────

export const usersRepo = {
  async findById(id: string, tenantId: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.tenantId, tenantId), isNull(users.deletedAt)),
    });
  },

  async findByEmail(email: string, tenantId: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.tenantId, tenantId), isNull(users.deletedAt)),
    });
  },

  async findByUsername(username: string, tenantId: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        eq(users.tenantId, tenantId),
        isNull(users.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      status?: string;
    },
  ): Promise<{ data: User[]; total: number }> {
    const { limit = 50, offset = 0, status } = args ?? {};
    const conditions: SQL[] = [eq(users.tenantId, tenantId), isNull(users.deletedAt)];

    if (status) {
      conditions.push(eq(users.status, status));
    }

    const where = and(...conditions);

    const data = await db.query.users.findMany({
      where,
      orderBy: asc(users.createdAt),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(users).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: {
    email: string;
    name: string;
    username: string;
    status?: string;
    tenantId: string;
  }): Promise<User> {
    const [result] = await db.insert(users).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<Pick<User, 'name' | 'email' | 'username' | 'status'>>,
  ): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId), isNull(users.deletedAt)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
  },

  async countByTenantId(tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), isNull(users.deletedAt)));
    return result.count;
  },
};

// ─── Roles Repository ───────────────────────────────────────────────────────

export const rolesRepo = {
  async findById(id: string, tenantId: string): Promise<Role | undefined> {
    return db.query.roles.findFirst({
      where: and(eq(roles.id, id), eq(roles.tenantId, tenantId), isNull(roles.deletedAt)),
    });
  },

  async findByName(name: string, tenantId: string): Promise<Role | undefined> {
    return db.query.roles.findFirst({
      where: and(eq(roles.name, name), eq(roles.tenantId, tenantId), isNull(roles.deletedAt)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: Role[]; total: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = and(eq(roles.tenantId, tenantId), isNull(roles.deletedAt));

    const data = await db.query.roles.findMany({
      where,
      orderBy: asc(roles.name),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(roles).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: {
    name: string;
    description?: string;
    isSystem?: boolean;
    tenantId: string;
  }): Promise<Role> {
    const [result] = await db.insert(roles).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<Pick<Role, 'name' | 'description'>>,
  ): Promise<Role> {
    const [result] = await db
      .update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId), isNull(roles.deletedAt)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<void> {
    await db
      .update(roles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));
  },
};

// ─── User Roles Repository ──────────────────────────────────────────────────

export const userRolesRepo = {
  async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | undefined> {
    return db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    });
  },

  async findByUserId(userId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
    });
  },

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({
      where: eq(userRoles.roleId, roleId),
    });
  },

  async assign(data: { userId: string; roleId: string }): Promise<UserRole> {
    const [result] = await db.insert(userRoles).values(data).returning();
    return result;
  },

  async remove(userId: string, roleId: string): Promise<void> {
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  },

  async removeAllForUser(userId: string): Promise<void> {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
  },
};

// ─── Permissions Repository ─────────────────────────────────────────────────

export const permissionsRepo = {
  async findById(id: string, tenantId: string): Promise<Permission | undefined> {
    return db.query.permissions.findFirst({
      where: and(eq(permissions.id, id), eq(permissions.tenantId, tenantId)),
    });
  },

  async findByRoleId(roleId: string, tenantId: string): Promise<Permission[]> {
    return db.query.permissions.findMany({
      where: and(eq(permissions.roleId, roleId), eq(permissions.tenantId, tenantId)),
      orderBy: asc(permissions.resource),
    });
  },

  async findByRoleAndResource(
    roleId: string,
    resource: string,
    action: string,
    tenantId: string,
  ): Promise<Permission | undefined> {
    return db.query.permissions.findFirst({
      where: and(
        eq(permissions.roleId, roleId),
        eq(permissions.resource, resource),
        eq(permissions.action, action),
        eq(permissions.tenantId, tenantId),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: Permission[]; total: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = eq(permissions.tenantId, tenantId);

    const data = await db.query.permissions.findMany({
      where,
      orderBy: asc(permissions.resource),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(permissions).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: {
    roleId: string;
    resource: string;
    action: string;
    tenantId: string;
  }): Promise<Permission> {
    const [result] = await db.insert(permissions).values(data).returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .delete(permissions)
      .where(and(eq(permissions.id, id), eq(permissions.tenantId, tenantId)));
  },

  async deleteByRoleId(roleId: string, tenantId: string): Promise<void> {
    await db
      .delete(permissions)
      .where(and(eq(permissions.roleId, roleId), eq(permissions.tenantId, tenantId)));
  },
};

// ─── Sessions Repository ────────────────────────────────────────────────────

export const sessionsRepo = {
  async findById(id: string, tenantId: string): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(eq(sessions.id, id), eq(sessions.tenantId, tenantId), isNull(sessions.deletedAt)),
    });
  },

  async findByToken(token: string, tenantId: string): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        eq(sessions.tenantId, tenantId),
        isNull(sessions.deletedAt),
      ),
    });
  },

  async findManyByUserId(userId: string, tenantId: string): Promise<Session[]> {
    return db.query.sessions.findMany({
      where: and(
        eq(sessions.userId, userId),
        eq(sessions.tenantId, tenantId),
        isNull(sessions.deletedAt),
      ),
      orderBy: asc(sessions.createdAt),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: Session[]; total: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = and(eq(sessions.tenantId, tenantId), isNull(sessions.deletedAt));

    const data = await db.query.sessions.findMany({
      where,
      orderBy: asc(sessions.createdAt),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(sessions).where(where);

    return { data, total: totalResult.count };
  },

  async softDelete(id: string, tenantId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ deletedAt: new Date() })
      .where(and(eq(sessions.id, id), eq(sessions.tenantId, tenantId)));
  },

  async deleteAllForUser(userId: string, tenantId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ deletedAt: new Date() })
      .where(and(eq(sessions.userId, userId), eq(sessions.tenantId, tenantId)));
  },
};
