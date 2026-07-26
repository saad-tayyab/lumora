import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
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

async function query<T = Record<string, unknown>>(pool: Pool, text: string, params?: unknown[]) {
  const result = await pool.query<T>(text, params);
  return result.rows;
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
  'users', 'roles', 'user_roles', 'sessions', 'credentials',
  'oauth_providers', 'mfa_config', 'permissions',
  'asset_categories', 'fixed_assets', 'depreciation_schedules',
  'depreciation_entries', 'asset_adjustments', 'tax_codes',
  'tax_rates', 'tax_auto_assignment_rules', 'budget_headers',
  'budget_lines', 'budget_consumptions', 'audit_log_entries',
  'report_templates', 'reports', 'report_schedules',
  'report_exports', 'dashboards', 'kpis', 'data_sources',
  'workflows', 'workflow_steps', 'training_data', 'ai_models',
  'predictions', 'anomaly_detections',
];

let pool: Pool;

beforeAll(async () => {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not found. CWD: ${process.cwd()}`);
  }
  pool = new Pool({ connectionString: databaseUrl });
});

afterAll(async () => {
  await pool?.end();
});

describe('Migration Safety — Schema Integrity', () => {
  describe('1. All expected tables exist', () => {
    it('should have all 78 tables in the database', async () => {
      const rows = await query<{ table_name: string }>(
        pool,
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      );
      const actualTables = rows.map((r) => r.table_name);
      for (const expected of EXPECTED_TABLES) {
        expect(actualTables).toContain(expected);
      }
    });

    it('should have exactly 78 tables', async () => {
      const rows = await query<{ count: string }>(
        pool,
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
      );
      expect(Number(rows[0].count)).toBe(78);
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
        const rows = await query<{ data_type: string }>(
          pool,
          `SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
          [table, column],
        );
        expect(rows[0]?.data_type).toBe(expectedType);
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
        const rows = await query<{ indexname: string }>(
          pool,
          `SELECT indexname FROM pg_indexes
           WHERE schemaname = 'public' AND tablename = $1
             AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%' || $2 || '%'`,
          [table, column],
        );
        expect(rows.length).toBeGreaterThan(0);
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
        const rows = await query<{ constraint_name: string }>(
          pool,
          `SELECT tc.constraint_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
           JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
           WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
             AND tc.table_name = $1 AND kcu.column_name = $2 AND ccu.table_name = $3`,
          [table, column, refTable],
        );
        expect(rows.length).toBeGreaterThan(0);
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
        const rows = await query<{ numeric_precision: string; numeric_scale: string }>(
          pool,
          `SELECT numeric_precision, numeric_scale
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
          [table, column],
        );
        expect(Number(rows[0]?.numeric_precision)).toBe(expectedPrecision);
        expect(Number(rows[0]?.numeric_scale)).toBe(expectedScale);
      });
    }
  });

  describe('6. Soft delete columns exist', () => {
    const softDeleteTables = ['accounts', 'users', 'roles', 'customers', 'vendors', 'items'];

    for (const table of softDeleteTables) {
      it(`${table} should have a deleted_at column`, async () => {
        const rows = await query<{ column_name: string }>(
          pool,
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'deleted_at'`,
          [table],
        );
        expect(rows.length).toBe(1);
      });
    }
  });

  describe('7. Tenant columns exist', () => {
    const tenantTables = ['accounts', 'users', 'customers', 'invoices', 'bills'];

    for (const table of tenantTables) {
      it(`${table} should have a tenant_id column`, async () => {
        const rows = await query<{ column_name: string }>(
          pool,
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenant_id'`,
          [table],
        );
        expect(rows.length).toBe(1);
      });
    }
  });

  describe('8. Relations file covers all tables', () => {
    it('should have relation entries for all 78 tables', async () => {
      const { relations } = await import('./schema/relations');
      const rows = await query<{ table_name: string }>(
        pool,
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      );
      const dbTables = rows.map((r) => r.table_name);
      const relationKeys = Object.keys(relations);
      for (const table of dbTables) {
        const camelCase = table.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
        expect(relationKeys).toContain(camelCase);
      }
    });
  });
});
