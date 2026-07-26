const roleHierarchy: Record<string, string[]> = {
  super_admin: ['admin', 'manager', 'user'],
  admin: ['manager', 'user'],
  manager: ['user'],
  user: [],
};

export class ForbiddenError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function requireRole(userRole: string, requiredRole: string): void {
  const allowedRoles = roleHierarchy[userRole] || [];

  if (userRole !== requiredRole && !allowedRoles.includes(requiredRole)) {
    throw new ForbiddenError();
  }
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  if (userRole === requiredRole) return true;
  const allowedRoles = roleHierarchy[userRole] || [];
  return allowedRoles.includes(requiredRole);
}
