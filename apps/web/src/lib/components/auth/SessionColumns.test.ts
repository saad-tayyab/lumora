import { expect, test, describe } from 'vitest';
import { columns, type ColumnDef } from './SessionColumns';

describe('SessionColumns', () => {
	test('exports columns array', () => {
		expect(columns).toBeDefined();
		expect(Array.isArray(columns)).toBe(true);
	});

	test('has 5 column definitions', () => {
		expect(columns.length).toBe(5);
	});

	test('userId column has correct key and label', () => {
		const col = columns.find((c) => c.key === 'userId');
		expect(col).toBeDefined();
		expect(col!.label).toBe('User ID');
	});

	test('ipAddress column has correct key and label', () => {
		const col = columns.find((c) => c.key === 'ipAddress');
		expect(col).toBeDefined();
		expect(col!.label).toBe('IP Address');
	});

	test('userAgent column has correct key and label', () => {
		const col = columns.find((c) => c.key === 'userAgent');
		expect(col).toBeDefined();
		expect(col!.label).toBe('User Agent');
	});

	test('expiresAt column has correct key and label and format function', () => {
		const col = columns.find((c) => c.key === 'expiresAt');
		expect(col).toBeDefined();
		expect(col!.label).toBe('Expires');
		expect(typeof col!.format).toBe('function');
	});

	test('createdAt column has correct key and label and format function', () => {
		const col = columns.find((c) => c.key === 'createdAt');
		expect(col).toBeDefined();
		expect(col!.label).toBe('Created');
		expect(typeof col!.format).toBe('function');
	});

	test('all columns have key and label', () => {
		for (const col of columns) {
			expect(col.key).toBeTruthy();
			expect(col.label).toBeTruthy();
		}
	});
});
