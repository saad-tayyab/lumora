import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercent, classNames } from './format';

describe('formatCurrency edge cases', () => {
  it('formats negative amounts', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats very large numbers', () => {
    expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
  });

  it('formats negative zero', () => {
    const result = formatCurrency(-0);
    expect(result).toMatch(/\$0\.00/);
  });

  it('formats string input', () => {
    expect(formatCurrency('42.5')).toBe('$42.50');
  });

  it('formats negative string input', () => {
    expect(formatCurrency('-99.99')).toBe('-$99.99');
  });

  it('returns $0.00 for NaN string input', () => {
    expect(formatCurrency('not-a-number')).toBe('$0.00');
  });

  it('returns $0.00 for empty string', () => {
    expect(formatCurrency('')).toBe('$0.00');
  });

  it('formats with custom currency', () => {
    expect(formatCurrency(100, 'EUR')).toContain('100.00');
  });

  it('formats single cent', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });
});

describe('formatDate edge cases', () => {
  it('formats a valid Date object', () => {
    const date = new Date('2026-03-15T00:00:00Z');
    const result = formatDate(date);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2026-07-04');
    expect(result).toContain('Jul');
    expect(result).toContain('4');
    expect(result).toContain('2026');
  });

  it('throws RangeError for invalid date string', () => {
    expect(() => formatDate('not-a-date')).toThrow(RangeError);
  });

  it('throws RangeError for empty string', () => {
    expect(() => formatDate('')).toThrow(RangeError);
  });
});

describe('formatNumber edge cases', () => {
  it('formats NaN input as 0', () => {
    expect(formatNumber(NaN)).toBe('0');
  });

  it('formats NaN string as 0', () => {
    expect(formatNumber('not-a-number')).toBe('0');
  });

  it('formats zero with decimals', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-42.5)).toBe('-42.50');
  });

  it('formats with custom decimal places', () => {
    expect(formatNumber(3.14159, 4)).toBe('3.1416');
  });

  it('formats with zero decimals', () => {
    expect(formatNumber(42.7, 0)).toBe('43');
  });
});

describe('formatPercent edge cases', () => {
  it('formats negative values', () => {
    expect(formatPercent(-0.05)).toBe('-5.0%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats NaN as 0%', () => {
    expect(formatPercent(NaN)).toBe('0%');
  });

  it('formats NaN string as 0%', () => {
    expect(formatPercent('not-a-number')).toBe('0%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercent(0.12345, 2)).toBe('12.35%');
  });

  it('formats 100%', () => {
    expect(formatPercent(1)).toBe('100.0%');
  });

  it('formats values over 100%', () => {
    expect(formatPercent(1.5)).toBe('150.0%');
  });
});

describe('classNames', () => {
  it('joins truthy classes', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(classNames('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('returns empty string for all falsy', () => {
    expect(classNames(false, null, undefined)).toBe('');
  });
});
