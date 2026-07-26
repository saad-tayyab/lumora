import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

function loadEnv() {
  const candidates = [
    resolve(process.cwd(), '../../.env'),
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '.env'),
  ];
  for (const envPath of candidates) {
    try {
      const envContent = readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      return;
    } catch {
      continue;
    }
  }
}

const EXPECTED_TABLES = [
  'accounts', 'journal_entries', 'journal_entry_lines', 'fiscal_years',
  'customers', 'invoices', 'invoice_line_items', 'payments',
  'payment_applications', 'credit_notes', 'vendors', 'bills',
  'bill_line_items', 'vendor_payments', 'payment_schedules',
  'bank_accounts', 'bank_transfers', 'bank_statements',
  'reconciliation_entries', 'currencies', 'bank_connections',
  'items', 'item_categories', 'warehouses', 'stock_levels',
  'stock_movements', 'unit_of_measures', 'purchase_orders',
  'po_line_items', 'receiving_reports', 'vendor_catalog_items',
  'sales_orders', 'sales_order_line_items', 'quotations',
  'quotation_line_items', 'discount_policies', 'departments',
  'designations', 'employees', 'attendance', 'leave_types',
  'leave_requests', 'salaries', 'payroll', 'payslips',
  'users', 'roles', 'user_roles', 'sessions', 'account',
  'verification', 'mfa_config', 'permissions',
  'asset_categories', 'fixed_assets', 'depreciation_schedules',
  'depreciation_entries', 'asset_adjustments', 'tax_codes',
  'tax_rates', 'tax_auto_assignment_rules', 'budget_headers',
  'budget_lines', 'budget_consumptions', 'audit_log_entries',
  'report_templates', 'reports', 'report_schedules',
  'report_exports', 'dashboards', 'kpis', 'data_sources',
  'workflows', 'workflow_steps', 'training_data', 'ai_models',
  'predictions', 'anomaly_detections',
];

let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not found. CWD: ${process.cwd()}`);
  }
  db = drizzle(databaseUrl);
});

describe('Migration Safety — Schema Integrity', () => {
  describe('1. All expected tables exist', () => {
    it('should have all expected tables in the database', async () => {
      const result = await db.execute<{ table_name: string }>(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      );
      const actualTables = result.rows.map((r) => r.table_name);
      for (const expected of EXPECTED_TABLES) {
        expect(actualTables).toContain(expected);
      }
    });

    it('should have exactly the expected number of tables', async () => {
      const result = await db.execute<{ count: string }>(
        sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
      );
      expect(Number(result.rows[0].count)).toBe(EXPECTED_TABLES.length);
    });
  });

  describe('2. Critical columns have correct types', () => {
    const checks = [
      { table: 'accounts', column: 'id', expectedType: 'uuid' },
      { table: 'accounts', column: 'balance', expectedType: 'numeric' },
      { table: 'journal_entries', column: 'status', expectedType: 'USER-DEFINED' },
      { table: 'invoices', column: 'total_amount', expectedType: 'numeric' },
      { table: 'users', column: 'email', expectedType: 'character varying' },
    ];

    for (const { table, column, expectedType } of checks) {
      it(`${table}.${column} should be ${expectedType}`, async () => {
        const result = await db.execute<{ data_type: string }>(
          sql`SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}`,
        );
        expect(result.rows[0]?.data_type).toBe(expectedType);
      });
    }
  });

  describe('3. Unique constraints exist', () => {
    const uniqueChecks = [
      { table: 'accounts', column: 'code' },
      { table: 'users', column: 'email' },
      { table: 'tax_codes', column: 'code' },
    ];

    for (const { table, column } of uniqueChecks) {
      it(`${table}.${column} should have a unique constraint`, async () => {
        const result = await db.execute<{ indexname: string }>(
          sql`SELECT indexname FROM pg_indexes
           WHERE schemaname = 'public' AND tablename = ${table}
             AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE ${'%' + column + '%'}`,
        );
        expect(result.rows.length).toBeGreaterThan(0);
      });
    }
  });

  describe('4. Foreign keys exist', () => {
    const fkChecks = [
      { table: 'journal_entry_lines', column: 'journal_entry_id', refTable: 'journal_entries' },
      { table: 'invoices', column: 'customer_id', refTable: 'customers' },
      { table: 'bills', column: 'vendor_id', refTable: 'vendors' },
    ];

    for (const { table, column, refTable } of fkChecks) {
      it(`${table}.${column} → ${refTable}.id`, async () => {
        const result = await db.execute<{ constraint_name: string }>(
          sql`SELECT tc.constraint_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
           JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
           WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
             AND tc.table_name = ${table} AND kcu.column_name = ${column} AND ccu.table_name = ${refTable}`,
        );
        expect(result.rows.length).toBeGreaterThan(0);
      });
    }
  });

  describe('5. Decimal precision', () => {
    const decimalChecks = [
      { table: 'accounts', column: 'balance', expectedPrecision: 19, expectedScale: 4 },
      { table: 'invoices', column: 'total_amount', expectedPrecision: 19, expectedScale: 4 },
    ];

    for (const { table, column, expectedPrecision, expectedScale } of decimalChecks) {
      it(`${table}.${column} should be numeric(${expectedPrecision},${expectedScale})`, async () => {
        const result = await db.execute<{ numeric_precision: string; numeric_scale: string }>(
          sql`SELECT numeric_precision, numeric_scale
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}`,
        );
        expect(Number(result.rows[0]?.numeric_precision)).toBe(expectedPrecision);
        expect(Number(result.rows[0]?.numeric_scale)).toBe(expectedScale);
      });
    }
  });

  describe('6. Soft delete columns exist', () => {
    const softDeleteTables = ['accounts', 'users', 'roles', 'customers', 'vendors', 'items'];

    for (const table of softDeleteTables) {
      it(`${table} should have a deleted_at column`, async () => {
        const result = await db.execute<{ column_name: string }>(
          sql`SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = ${table} AND column_name = 'deleted_at'`,
        );
        expect(result.rows.length).toBe(1);
      });
    }
  });

  describe('7. Tenant columns exist', () => {
    const tenantTables = ['accounts', 'users', 'customers', 'invoices', 'bills'];

    for (const table of tenantTables) {
      it(`${table} should have a tenant_id column`, async () => {
        const result = await db.execute<{ column_name: string }>(
          sql`SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = ${table} AND column_name = 'tenant_id'`,
        );
        expect(result.rows.length).toBe(1);
      });
    }
  });

  describe('8. Relations file covers all tables', () => {
    it('should have relation entries for all tables', async () => {
      const { relations } = await import('./schema/relations');
      const result = await db.execute<{ table_name: string }>(
        sql`SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      );
      const dbTables = result.rows.map((r) => r.table_name);
      const relationKeys = Object.keys(relations);
      for (const table of dbTables) {
        const camelCase = table.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
        expect(relationKeys).toContain(camelCase);
      }
    });
  });
});
