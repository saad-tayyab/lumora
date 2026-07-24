import { and, asc, count, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import { roles, userRoles, users } from './schema';

// ─── Types ────────────────────────────────────────────────────────────────────

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

type Role = typeof roles.$inferSelect;
type NewRole = typeof roles.$inferInsert;

type UserRole = typeof userRoles.$inferSelect;
type NewUserRole = typeof userRoles.$inferInsert;

// ─── Users Repository ─────────────────────────────────────────────────────────

export const usersRepository = {
  /**
   * Find a user by ID (excludes soft-deleted records).
   */
  async findById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), isNull(users.deletedAt)),
    });
  },

  /**
   * Find many users with pagination and optional ordering.
   */
  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: User[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(users.createdAt) } = args ?? {};

    const data = await db.query.users.findMany({
      limit,
      offset,
      orderBy,
      where: isNull(users.deletedAt),
    });

    const total = await db.select({ count: count() }).from(users).where(isNull(users.deletedAt));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find a user by email (excludes soft-deleted records).
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.email, email), isNull(users.deletedAt)),
    });
  },

  /**
   * Find a user by username (excludes soft-deleted records).
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.username, username), isNull(users.deletedAt)),
    });
  },

  /**
   * Find all users belonging to a specific tenant.
   */
  async findByTenantId(
    tenantId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: User[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(users.createdAt) } = args ?? {};

    const data = await db.query.users.findMany({
      limit,
      offset,
      orderBy,
      where: and(eq(users.tenantId, tenantId), isNull(users.deletedAt)),
    });

    const total = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), isNull(users.deletedAt)));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all users with a given status (e.g., 'active', 'suspended').
   */
  async findByStatus(
    status: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: User[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(users.createdAt) } = args ?? {};

    const data = await db.query.users.findMany({
      limit,
      offset,
      orderBy,
      where: and(eq(users.status, status), isNull(users.deletedAt)),
    });

    const total = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.status, status), isNull(users.deletedAt)));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all users within a tenant that have a specific status.
   */
  async findByTenantIdAndStatus(
    tenantId: string,
    status: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: User[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(users.createdAt) } = args ?? {};

    const data = await db.query.users.findMany({
      limit,
      offset,
      orderBy,
      where: and(eq(users.tenantId, tenantId), eq(users.status, status), isNull(users.deletedAt)),
    });

    const total = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.status, status), isNull(users.deletedAt)));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Create a new user.
   */
  async create(data: NewUser): Promise<User[]> {
    return db.insert(users).values(data).returning();
  },

  /**
   * Update a user by ID (soft-deleted records excluded).
   */
  async update(id: string, data: Partial<NewUser>): Promise<User[]> {
    return db
      .update(users)
      .set(data)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
  },

  /**
   * Soft-delete a user by ID. Sets deletedAt to the current timestamp.
   */
  async delete(id: string): Promise<User[]> {
    return db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
  },
};

// ─── Roles Repository ─────────────────────────────────────────────────────────

export const rolesRepository = {
  /**
   * Find a role by ID (excludes soft-deleted records).
   */
  async findById(id: string): Promise<Role | undefined> {
    return db.query.roles.findFirst({
      where: and(eq(roles.id, id), isNull(roles.deletedAt)),
    });
  },

  /**
   * Find many roles with pagination and optional ordering.
   */
  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Role[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(roles.createdAt) } = args ?? {};

    const data = await db.query.roles.findMany({
      limit,
      offset,
      orderBy,
      where: isNull(roles.deletedAt),
    });

    const total = await db.select({ count: count() }).from(roles).where(isNull(roles.deletedAt));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find a role by name within a specific tenant.
   */
  async findByName(tenantId: string, name: string): Promise<Role | undefined> {
    return db.query.roles.findFirst({
      where: and(eq(roles.tenantId, tenantId), eq(roles.name, name), isNull(roles.deletedAt)),
    });
  },

  /**
   * Find all roles belonging to a specific tenant.
   */
  async findByTenantId(
    tenantId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: Role[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(roles.createdAt) } = args ?? {};

    const data = await db.query.roles.findMany({
      limit,
      offset,
      orderBy,
      where: and(eq(roles.tenantId, tenantId), isNull(roles.deletedAt)),
    });

    const total = await db
      .select({ count: count() })
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), isNull(roles.deletedAt)));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all system-defined roles (isSystem = true).
   */
  async findSystemRoles(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Role[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(roles.createdAt) } = args ?? {};

    const data = await db.query.roles.findMany({
      limit,
      offset,
      orderBy,
      where: and(eq(roles.isSystem, true), isNull(roles.deletedAt)),
    });

    const total = await db
      .select({ count: count() })
      .from(roles)
      .where(and(eq(roles.isSystem, true), isNull(roles.deletedAt)));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Create a new role.
   */
  async create(data: NewRole): Promise<Role[]> {
    return db.insert(roles).values(data).returning();
  },

  /**
   * Update a role by ID (soft-deleted records excluded).
   */
  async update(id: string, data: Partial<NewRole>): Promise<Role[]> {
    return db
      .update(roles)
      .set(data)
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .returning();
  },

  /**
   * Soft-delete a role by ID. Sets deletedAt to the current timestamp.
   */
  async delete(id: string): Promise<Role[]> {
    return db
      .update(roles)
      .set({ deletedAt: new Date() })
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .returning();
  },
};

// ─── User Roles Repository ────────────────────────────────────────────────────
// Note: userRoles has no `id` column — lookups use the composite (userId, roleId).

export const userRolesRepository = {
  /**
   * Find a specific user-role assignment.
   */
  async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | undefined> {
    return db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    });
  },

  /**
   * Find all roles assigned to a user.
   */
  async findByUserId(userId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
    });
  },

  /**
   * Find all users assigned to a role.
   */
  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return db.query.userRoles.findMany({
      where: eq(userRoles.roleId, roleId),
    });
  },

  /**
   * Assign a role to a user.
   */
  async create(data: NewUserRole): Promise<UserRole[]> {
    return db.insert(userRoles).values(data).returning();
  },

  /**
   * Remove a role assignment from a user.
   */
  async delete(userId: string, roleId: string): Promise<UserRole[]> {
    return db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .returning();
  },

  /**
   * Remove all role assignments for a user.
   */
  async deleteByUserId(userId: string): Promise<UserRole[]> {
    return db.delete(userRoles).where(eq(userRoles.userId, userId)).returning();
  },

  /**
   * Remove all user assignments for a role.
   */
  async deleteByRoleId(roleId: string): Promise<UserRole[]> {
    return db.delete(userRoles).where(eq(userRoles.roleId, roleId)).returning();
  },
};
