import { describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { testDb } from './lib/test-db';

describe('Database Connection', () => {
  it('should connect and execute a simple query', async () => {
    const result = await testDb.execute(sql`SELECT 1 AS value`);
    expect(result.rows[0]).toEqual({ value: 1 });
  });

  it('should return current database time', async () => {
    const result = await testDb.execute(sql`SELECT NOW() AS now`);
    expect(result.rows[0].now).toBeDefined();
  });

  it('should have access to the accounts table', async () => {
    const result = await testDb.execute(sql`SELECT COUNT(*) AS count FROM accounts`);
    expect(Number(result.rows[0].count)).toBeGreaterThanOrEqual(0);
  });

  it('should have access to all core tables', async () => {
    const tables = [
      'accounts',
      'journal_entries',
      'journal_entry_lines',
      'fiscal_years',
      'customers',
      'invoices',
      'vendors',
      'bills',
      'bank_accounts',
      'items',
      'employees',
      'fixed_assets',
      'tax_codes',
      'budget_headers',
      'audit_log_entries',
      'users',
      'roles',
    ];

    for (const table of tables) {
      const result = await testDb.execute(sql.raw(`SELECT COUNT(*) AS count FROM "${table}"`));
      expect(Number(result.rows[0].count)).toBeGreaterThanOrEqual(0);
    }
  });

  it('should support transactions that commit', async () => {
    const result = await testDb.transaction(async (tx) => {
      const r = await tx.execute(sql`SELECT 1 AS value`);
      return r.rows[0].value;
    });
    expect(result).toBe(1);
  });

  it('should support transactions that rollback', async () => {
    let threw = false;
    try {
      await testDb.transaction(async (tx) => {
        await tx.execute(sql`SELECT 1`);
        throw new Error('intentional rollback');
      });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  it('should handle concurrent queries', async () => {
    const queries = Array.from({ length: 5 }, (_, i) =>
      testDb.execute(sql`SELECT ${i} AS idx`),
    );
    const results = await Promise.all(queries);
    results.forEach((r, i) => {
      expect(Number(r.rows[0].idx)).toBe(i);
    });
  });

  it('should have valid connection pool', async () => {
    const start = Date.now();
    const queries = Array.from({ length: 10 }, () =>
      testDb.execute(sql`SELECT 1`),
    );
    await Promise.all(queries);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});
