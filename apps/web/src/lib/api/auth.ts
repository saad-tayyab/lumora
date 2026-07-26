import { api, type PaginatedResponse } from '$lib/api';
import type { AuthSession, Permission, Role, User, UserRole } from '$lib/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(params?: { page?: number; limit?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return api.get<PaginatedResponse<User>>(`/users${q ? `?${q}` : ''}`);
}

export async function getUser(id: string) {
  return api.get<User>(`/users/${id}`);
}

export async function createUser(data: {
  email: string;
  name: string;
  username: string;
  status?: string;
}) {
  return api.post<User>('/users', data);
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    username?: string;
    status?: string;
  },
) {
  return api.put<User>(`/users/${id}`, data);
}

export async function deleteUser(id: string) {
  return api.del<void>(`/users/${id}`);
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function listRoles(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<Role>>(`/roles${q ? `?${q}` : ''}`);
}

export async function getRole(id: string) {
  return api.get<Role>(`/roles/${id}`);
}

export async function createRole(data: { name: string; description?: string; isSystem?: boolean }) {
  return api.post<Role>('/roles', data);
}

export async function updateRole(id: string, data: { name?: string; description?: string | null }) {
  return api.put<Role>(`/roles/${id}`, data);
}

export async function deleteRole(id: string) {
  return api.del<void>(`/roles/${id}`);
}

// ─── User Roles ───────────────────────────────────────────────────────────────

export async function assignRole(data: { userId: string; roleId: string }) {
  return api.post<UserRole>('/user-roles', data);
}

export async function revokeRole(data: { userId: string; roleId: string }) {
  return api.del<void>('/user-roles', data);
}

export async function listUserRoles(userId: string) {
  return api.get<UserRole[]>(`/users/${userId}/roles`);
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function listPermissions(params?: { page?: number; limit?: number; roleId?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.roleId) qs.set('roleId', params.roleId);
  const q = qs.toString();
  return api.get<PaginatedResponse<Permission>>(`/permissions${q ? `?${q}` : ''}`);
}

export async function createPermission(data: { roleId: string; resource: string; action: string }) {
  return api.post<Permission>('/permissions', data);
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function listSessions(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<AuthSession>>(`/sessions${q ? `?${q}` : ''}`);
}

export async function invalidateSession(id: string) {
  return api.del<void>(`/sessions/${id}`);
}

export async function invalidateAllUserSessions(userId: string) {
  return api.del<void>(`/users/${userId}/sessions`);
}
