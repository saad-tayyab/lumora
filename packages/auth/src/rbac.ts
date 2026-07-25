import { APIError } from 'encore.dev/api';

const roleHierarchy: Record<string, string[]> = {
  super_admin: ['admin', 'manager', 'user'],
  admin: ['manager', 'user'],
  manager: ['user'],
  user: [],
};

export function requireRole(userRole: string, requiredRole: string): void {
  const allowedRoles = roleHierarchy[userRole] || [];

  if (userRole !== requiredRole && !allowedRoles.includes(requiredRole)) {
    throw new APIError('Forbidden', 'Insufficient permissions', 403);
  }
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  if (userRole === requiredRole) return true;
  const allowedRoles = roleHierarchy[userRole] || [];
  return allowedRoles.includes(requiredRole);
}
