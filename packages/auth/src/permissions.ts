import { createAccessControl } from 'better-auth/plugins/access';

const statement = {
  financial: ['read', 'create', 'update', 'delete'],
  inventory: ['read', 'create', 'update', 'delete'],
  purchase_order: ['read', 'create', 'update', 'delete', 'approve'],
  sales_order: ['read', 'create', 'update', 'delete', 'approve'],
  hr: ['read', 'create', 'update', 'delete'],
  reports: ['read', 'export'],
  settings: ['read', 'update'],
  audit: ['read'],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  financial: ['read', 'create', 'update', 'delete'],
  inventory: ['read', 'create', 'update', 'delete'],
  purchase_order: ['read', 'create', 'update', 'delete', 'approve'],
  sales_order: ['read', 'create', 'update', 'delete', 'approve'],
  hr: ['read', 'create', 'update', 'delete'],
  reports: ['read', 'export'],
  settings: ['read', 'update'],
  audit: ['read'],
});

export const admin = ac.newRole({
  financial: ['read', 'create', 'update'],
  inventory: ['read', 'create', 'update'],
  purchase_order: ['read', 'create', 'update'],
  sales_order: ['read', 'create', 'update'],
  hr: ['read', 'create', 'update'],
  reports: ['read', 'export'],
  settings: ['read', 'update'],
});

export const accountant = ac.newRole({
  financial: ['read', 'create', 'update'],
  reports: ['read', 'export'],
  audit: ['read'],
});

export const member = ac.newRole({
  financial: ['read'],
  inventory: ['read'],
  reports: ['read'],
});
