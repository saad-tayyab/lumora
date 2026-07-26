import { describe, expect, it, vi } from 'vitest';
import { hasRole, requireRole } from './rbac';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status?: number) {
      super(message);
      this.code = code;
      this.status = status ?? 500;
    }
  },
}));

describe('hasRole', () => {
  it('should return true for exact role match', () => {
    expect(hasRole('admin', 'admin')).toBe(true);
    expect(hasRole('user', 'user')).toBe(true);
    expect(hasRole('manager', 'manager')).toBe(true);
  });

  it('should return true when user has higher role in hierarchy', () => {
    expect(hasRole('super_admin', 'admin')).toBe(true);
    expect(hasRole('super_admin', 'manager')).toBe(true);
    expect(hasRole('super_admin', 'user')).toBe(true);
    expect(hasRole('admin', 'manager')).toBe(true);
    expect(hasRole('admin', 'user')).toBe(true);
    expect(hasRole('manager', 'user')).toBe(true);
  });

  it('should return false when user has lower role', () => {
    expect(hasRole('user', 'admin')).toBe(false);
    expect(hasRole('user', 'manager')).toBe(false);
    expect(hasRole('manager', 'admin')).toBe(false);
  });

  it('should return false for unknown role', () => {
    expect(hasRole('unknown_role', 'user')).toBe(false);
    expect(hasRole('user', 'unknown_role')).toBe(false);
  });
});

describe('requireRole', () => {
  it('should not throw when role matches', () => {
    expect(() => requireRole('admin', 'admin')).not.toThrow();
  });

  it('should not throw when user has higher role', () => {
    expect(() => requireRole('super_admin', 'user')).not.toThrow();
    expect(() => requireRole('admin', 'manager')).not.toThrow();
  });

  it('should throw when role is insufficient', () => {
    expect(() => requireRole('user', 'admin')).toThrow('Insufficient permissions');
    expect(() => requireRole('user', 'manager')).toThrow('Insufficient permissions');
    expect(() => requireRole('manager', 'admin')).toThrow('Insufficient permissions');
  });

  it('should throw for unknown role', () => {
    expect(() => requireRole('unknown', 'user')).toThrow('Insufficient permissions');
  });
});
