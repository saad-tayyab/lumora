import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, generateId } from './utils';
import { DEFAULT_TENANT_ID, PAGE_SIZE, MAX_PAGE_SIZE } from './constants';

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format EUR', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('should format large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format whole numbers with decimals', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });
});

describe('formatDate', () => {
  it('should format Date object to YYYY-MM-DD', () => {
    const date = new Date('2026-07-15T10:30:00.000Z');
    expect(formatDate(date)).toBe('2026-07-15');
  });

  it('should format ISO string to YYYY-MM-DD', () => {
    expect(formatDate('2026-01-01T00:00:00.000Z')).toBe('2026-01-01');
  });

  it('should handle date at midnight', () => {
    expect(formatDate(new Date('2026-12-31T00:00:00.000Z'))).toBe('2026-12-31');
  });

  it('should format today', () => {
    const today = new Date();
    const result = formatDate(today);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('generateId', () => {
  it('should return a UUID v4 format', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should return unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('constants', () => {
  it('DEFAULT_TENANT_ID is a valid UUID format', () => {
    expect(DEFAULT_TENANT_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('PAGE_SIZE is 20', () => {
    expect(PAGE_SIZE).toBe(20);
  });

  it('MAX_PAGE_SIZE is 100', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('PAGE_SIZE <= MAX_PAGE_SIZE', () => {
    expect(PAGE_SIZE).toBeLessThanOrEqual(MAX_PAGE_SIZE);
  });
});
