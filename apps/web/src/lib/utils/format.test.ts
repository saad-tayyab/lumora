import { describe, expect, it } from 'vitest';
import {
  classNames,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from './format';

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats a string as USD currency', () => {
    expect(formatCurrency('99.9')).toBe('$99.90');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('returns $0.00 for NaN input', () => {
    expect(formatCurrency('not-a-number')).toBe('$0.00');
  });

  it('formats with custom currency', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2026-03-15T00:00:00Z');
    const result = formatDate(date);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('formats a date string', () => {
    const result = formatDate('2026-01-01');
    expect(result).toContain('Jan');
    expect(result).toContain('1');
    expect(result).toContain('2026');
  });
});

describe('formatDateTime', () => {
  it('formats a Date object with time', () => {
    const date = new Date('2026-06-20T14:30:00Z');
    const result = formatDateTime(date);
    expect(result).toContain('Jun');
    expect(result).toContain('20');
    expect(result).toContain('2026');
  });

  it('formats a date string with time', () => {
    const result = formatDateTime('2026-12-25T08:15:00Z');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
    expect(result).toContain('2026');
  });
});

describe('formatNumber', () => {
  it('formats a number with default decimals', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
  });

  it('formats a string number', () => {
    expect(formatNumber('999.999', 1)).toBe('1,000.0');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(42, 0)).toBe('42');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('returns 0 for NaN input', () => {
    expect(formatNumber('invalid')).toBe('0');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });
});

describe('formatPercent', () => {
  it('formats a decimal as percent', () => {
    expect(formatPercent(0.5)).toBe('50.0%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercent(0.12345, 2)).toBe('12.35%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats a string value', () => {
    expect(formatPercent('0.75')).toBe('75.0%');
  });

  it('returns 0% for NaN input', () => {
    expect(formatPercent('not-a-number')).toBe('0%');
  });

  it('formats 100%', () => {
    expect(formatPercent(1)).toBe('100.0%');
  });
});

describe('classNames', () => {
  it('joins class names', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(classNames('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string for no truthy values', () => {
    expect(classNames(false, null, undefined)).toBe('');
  });
});
