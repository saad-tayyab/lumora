import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000002';

async function seed() {
  console.log('Seeding database...');

  // ─── Roles ──────────────────────────────────────────────────────────────────
  const adminRole = await sql`
    INSERT INTO roles (id, tenant_id, name, description, is_system, created_at, updated_at)
    VALUES (gen_random_uuid(), ${TENANT_ID}, 'Admin', 'Full system administrator', true, NOW(), NOW())
    RETURNING id
  `;

  const managerRole = await sql`
    INSERT INTO roles (id, tenant_id, name, description, is_system, created_at, updated_at)
    VALUES (gen_random_uuid(), ${TENANT_ID}, 'Manager', 'Department manager with elevated permissions', true, NOW(), NOW())
    RETURNING id
  `;

  const userRole = await sql`
    INSERT INTO roles (id, tenant_id, name, description, is_system, created_at, updated_at)
    VALUES (gen_random_uuid(), ${TENANT_ID}, 'User', 'Standard user with basic permissions', true, NOW(), NOW())
    RETURNING id
  `;

  console.log('  Roles created: Admin, Manager, User');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO users (id, tenant_id, email, name, username, status, email_verified, mfa_enabled, created_at, updated_at)
    VALUES (${ADMIN_USER_ID}, ${TENANT_ID}, 'admin@lumora.app', 'System Admin', 'admin', 'active', true, false, NOW(), NOW())
  `;

  await sql`
    INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
    VALUES (gen_random_uuid(), ${ADMIN_USER_ID}, ${adminRole[0].id}, NOW(), NOW())
  `;

  console.log('  Admin user created: admin@lumora.app');

  // ─── Chart of Accounts ──────────────────────────────────────────────────────
  const accountSeeds = [
    { code: '1000', name: 'Cash', type: 'asset' },
    { code: '1010', name: 'Petty Cash', type: 'asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'asset' },
    { code: '1200', name: 'Inventory', type: 'asset' },
    { code: '1300', name: 'Prepaid Expenses', type: 'asset' },
    { code: '1500', name: 'Fixed Assets', type: 'asset' },
    { code: '1510', name: 'Accumulated Depreciation', type: 'asset' },
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '2100', name: 'Accrued Expenses', type: 'liability' },
    { code: '2200', name: 'Sales Tax Payable', type: 'liability' },
    { code: '2300', name: 'Income Tax Payable', type: 'liability' },
    { code: '2500', name: 'Long-term Liabilities', type: 'liability' },
    { code: '3000', name: "Owner's Equity", type: 'equity' },
    { code: '3100', name: 'Retained Earnings', type: 'equity' },
    { code: '3200', name: 'Current Year Earnings', type: 'equity' },
    { code: '4000', name: 'Sales Revenue', type: 'revenue' },
    { code: '4100', name: 'Service Revenue', type: 'revenue' },
    { code: '4200', name: 'Interest Income', type: 'revenue' },
    { code: '4300', name: 'Other Income', type: 'revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { code: '5100', name: 'Salary Expense', type: 'expense' },
    { code: '5200', name: 'Rent Expense', type: 'expense' },
    { code: '5300', name: 'Utilities Expense', type: 'expense' },
    { code: '5400', name: 'Office Supplies', type: 'expense' },
    { code: '5500', name: 'Depreciation Expense', type: 'expense' },
    { code: '5600', name: 'Insurance Expense', type: 'expense' },
    { code: '5700', name: 'Marketing Expense', type: 'expense' },
    { code: '5800', name: 'Travel Expense', type: 'expense' },
    { code: '5900', name: 'Miscellaneous Expense', type: 'expense' },
  ];

  for (const a of accountSeeds) {
    await sql`
      INSERT INTO accounts (id, tenant_id, code, name, type, balance, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${TENANT_ID}, ${a.code}, ${a.name}, ${a.type}::account_type, '0', true, NOW(), NOW())
    `;
  }

  console.log(`  Chart of accounts created: ${accountSeeds.length} accounts`);

  // ─── Fiscal Year ────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO fiscal_years (id, tenant_id, name, start_date, end_date, status, created_at, updated_at)
    VALUES (gen_random_uuid(), ${TENANT_ID}, 'FY 2026', '2026-01-01', '2026-12-31', 'open', NOW(), NOW())
  `;

  console.log('  Fiscal year created: FY 2026');

  // ─── Currencies ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO currencies (id, code, name, symbol, decimal_places, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'USD', 'US Dollar', '$', 2, true, NOW(), NOW()),
      (gen_random_uuid(), 'EUR', 'Euro', '€', 2, true, NOW(), NOW()),
      (gen_random_uuid(), 'GBP', 'British Pound', '£', 2, true, NOW(), NOW()),
      (gen_random_uuid(), 'PKR', 'Pakistani Rupee', 'Rs', 2, true, NOW(), NOW()),
      (gen_random_uuid(), 'JPY', 'Japanese Yen', '¥', 0, true, NOW(), NOW())
  `;

  console.log('  Currencies created: USD, EUR, GBP, PKR, JPY');

  // ─── Units of Measure ───────────────────────────────────────────────────────
  await sql`
    INSERT INTO unit_of_measures (id, code, name, category, decimal_places, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'EA', 'Each', 'count', 0, NOW(), NOW()),
      (gen_random_uuid(), 'KG', 'Kilogram', 'weight', 2, NOW(), NOW()),
      (gen_random_uuid(), 'G', 'Gram', 'weight', 2, NOW(), NOW()),
      (gen_random_uuid(), 'LB', 'Pound', 'weight', 2, NOW(), NOW()),
      (gen_random_uuid(), 'L', 'Liter', 'volume', 2, NOW(), NOW()),
      (gen_random_uuid(), 'ML', 'Milliliter', 'volume', 2, NOW(), NOW()),
      (gen_random_uuid(), 'M', 'Meter', 'length', 2, NOW(), NOW()),
      (gen_random_uuid(), 'CM', 'Centimeter', 'length', 2, NOW(), NOW()),
      (gen_random_uuid(), 'FT', 'Foot', 'length', 2, NOW(), NOW()),
      (gen_random_uuid(), 'SQM', 'Square Meter', 'area', 2, NOW(), NOW()),
      (gen_random_uuid(), 'BOX', 'Box', 'count', 0, NOW(), NOW()),
      (gen_random_uuid(), 'PCS', 'Pieces', 'count', 0, NOW(), NOW())
  `;

  console.log('  Units of measure created: 12 UoMs');

  // ─── Departments ────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO departments (id, tenant_id, name, code, description, status, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${TENANT_ID}, 'Human Resources', 'HR', 'Human resources and people operations', 'active', NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Finance', 'FIN', 'Financial operations and accounting', 'active', NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Operations', 'OPS', 'Business operations and logistics', 'active', NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Sales', 'SALES', 'Sales and business development', 'active', NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Information Technology', 'IT', 'Technology infrastructure and development', 'active', NOW(), NOW())
  `;

  console.log('  Departments created: HR, Finance, Operations, Sales, IT');

  // ─── Designations ───────────────────────────────────────────────────────────
  await sql`
    INSERT INTO designations (id, tenant_id, name, code, level, salary_band_min, salary_band_max, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${TENANT_ID}, 'CEO', 'CEO', 10, 150000, 300000, true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Director', 'DIR', 8, 100000, 200000, true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Manager', 'MGR', 6, 70000, 120000, true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Senior', 'SR', 4, 50000, 90000, true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Junior', 'JR', 2, 30000, 60000, true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Intern', 'INT', 1, 15000, 30000, true, NOW(), NOW())
  `;

  console.log('  Designations created: CEO, Director, Manager, Senior, Junior, Intern');

  // ─── Item Categories ────────────────────────────────────────────────────────
  await sql`
    INSERT INTO item_categories (id, tenant_id, name, code, description, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${TENANT_ID}, 'Electronics', 'ELEC', 'Electronic devices and components', true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Office Supplies', 'OFF', 'Office consumables and stationery', true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Furniture', 'FURN', 'Office furniture and fixtures', true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Raw Materials', 'RAW', 'Raw materials for production', true, NOW(), NOW()),
      (gen_random_uuid(), ${TENANT_ID}, 'Finished Goods', 'FG', 'Ready-to-sell products', true, NOW(), NOW())
  `;

  console.log('  Item categories created: 5 categories');

  console.log('\nSeed completed successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
