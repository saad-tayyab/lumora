import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { dateRange, positiveAmount, nonEmptyArray, paginationSchema, sortOrderSchema } from './helpers';

describe('dateRange', () => {
  const schema = dateRange();

  it('should accept valid date range', () => {
    const result = schema.safeParse({
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject endDate before startDate', () => {
    const result = schema.safeParse({
      startDate: '2026-12-31T00:00:00.000Z',
      endDate: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('End date must be after start date');
    }
  });

  it('should reject equal dates', () => {
    const result = schema.safeParse({
      startDate: '2026-06-15T12:00:00.000Z',
      endDate: '2026-06-15T12:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject malformed datetime strings', () => {
    const result = schema.safeParse({
      startDate: 'not-a-date',
      endDate: '2026-12-31T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ startDate: '2026-01-01T00:00:00.000Z' }).success).toBe(false);
    expect(schema.safeParse({ endDate: '2026-12-31T00:00:00.000Z' }).success).toBe(false);
  });

  it('should accept far-future dates', () => {
    const result = schema.safeParse({
      startDate: '2099-01-01T00:00:00.000Z',
      endDate: '2099-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('positiveAmount', () => {
  const schema = positiveAmount();

  it('should accept positive numbers', () => {
    expect(schema.safeParse(1).success).toBe(true);
    expect(schema.safeParse(0.01).success).toBe(true);
    expect(schema.safeParse(999999).success).toBe(true);
  });

  it('should reject zero', () => {
    expect(schema.safeParse(0).success).toBe(false);
  });

  it('should reject negative numbers', () => {
    expect(schema.safeParse(-1).success).toBe(false);
    expect(schema.safeParse(-0.01).success).toBe(false);
  });
});

describe('nonEmptyArray', () => {
  const schema = nonEmptyArray(z.string());

  it('should accept arrays with items', () => {
    expect(schema.safeParse(['a']).success).toBe(true);
    expect(schema.safeParse(['a', 'b', 'c']).success).toBe(true);
  });

  it('should reject empty arrays', () => {
    const result = schema.safeParse([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least one item required');
    }
  });

  it('should work with complex schemas', () => {
    const complexSchema = nonEmptyArray(z.object({ id: z.number(), name: z.string() }));
    expect(complexSchema.safeParse([{ id: 1, name: 'test' }]).success).toBe(true);
    expect(complexSchema.safeParse([]).success).toBe(false);
  });
});

describe('paginationSchema', () => {
  const schema = paginationSchema();

  it('should apply defaults when no input provided', () => {
    const result = schema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it('should accept valid input', () => {
    const result = schema.parse({ page: 3, limit: 50 });
    expect(result).toEqual({ page: 3, limit: 50 });
  });

  it('should reject page <= 0', () => {
    expect(schema.safeParse({ page: 0 }).success).toBe(false);
    expect(schema.safeParse({ page: -1 }).success).toBe(false);
  });

  it('should reject limit > 100', () => {
    expect(schema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(schema.safeParse({ page: 1.5 }).success).toBe(false);
    expect(schema.safeParse({ limit: 1.5 }).success).toBe(false);
  });

  it('should accept limit = 100 (boundary)', () => {
    expect(schema.safeParse({ limit: 100 }).success).toBe(true);
  });

  it('should accept limit = 1 (boundary)', () => {
    expect(schema.safeParse({ limit: 1 }).success).toBe(true);
  });
});

describe('sortOrderSchema', () => {
  const schema = sortOrderSchema();

  it('should accept valid sort order', () => {
    expect(schema.parse({ field: 'name', direction: 'asc' })).toEqual({ field: 'name', direction: 'asc' });
    expect(schema.parse({ field: 'name', direction: 'desc' })).toEqual({ field: 'name', direction: 'desc' });
  });

  it('should default direction to asc', () => {
    const result = schema.parse({ field: 'name' });
    expect(result.direction).toBe('asc');
  });

  it('should reject invalid direction', () => {
    expect(schema.safeParse({ field: 'name', direction: 'random' }).success).toBe(false);
  });

  it('should accept empty string field', () => {
    expect(schema.parse({ field: '' })).toEqual({ field: '', direction: 'asc' });
  });
});
