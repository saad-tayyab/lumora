import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);

// ─── Constants ────────────────────────────────────────────────────────────────
const T = '00000000-0000-0000-0000-000000000001'; // tenant
const ADMIN = '00000000-0000-0000-0000-000000000002';
const MANAGER = '00000000-0000-0000-0000-000000000003';
const USER = '00000000-0000-0000-0000-000000000004';
const DEV = '00000000-0000-0000-0000-000000000005';

// ─── Roles ────────────────────────────────────────────────────────────────────
const ROLE_ADMIN = '00000000-0000-0000-0000-000000000010';
const ROLE_MGR = '00000000-0000-0000-0000-000000000011';
const ROLE_USER = '00000000-0000-0000-0000-000000000012';

// ─── Accounts ─────────────────────────────────────────────────────────────────
const ACC_CASH = '00000000-0000-0000-0000-000000001100';
const ACC_PETTY = '00000000-0000-0000-0000-000000001101';
const ACC_AR = '00000000-0000-0000-0000-000000001110';
const ACC_INV = '00000000-0000-0000-0000-000000001120';
const ACC_PREPAID = '00000000-0000-0000-0000-000000001130';
const ACC_FIXED = '00000000-0000-0000-0000-000000001150';
const ACC_ACCDEPR = '00000000-0000-0000-0000-000000001151';
const ACC_AP = '00000000-0000-0000-0000-000000001200';
const ACC_ACCRUED = '00000000-0000-0000-0000-000000001210';
const ACC_SALESTAX = '00000000-0000-0000-0000-000000001220';
const ACCINCTAX = '00000000-0000-0000-0000-000000001230';
const ACC_LTLIAB = '00000000-0000-0000-0000-000000001250';
const ACC_OWNERS = '00000000-0000-0000-0000-000000001300';
const ACC_RETAIN = '00000000-0000-0000-0000-000000001310';
const ACC_CURR = '00000000-0000-0000-0000-000000001320';
const ACC_SALES = '00000000-0000-0000-0000-000000001400';
const ACC_SVC = '00000000-0000-0000-0000-000000001410';
const ACC_INT = '00000000-0000-0000-0000-000000001420';
const ACC_OTHINC = '00000000-0000-0000-0000-000000001430';
const ACC_COGS = '00000000-0000-0000-0000-000000001500';
const ACC_SALARY = '00000000-0000-0000-0000-000000001510';
const ACC_RENT = '00000000-0000-0000-0000-000000001520';
const ACC_UTIL = '00000000-0000-0000-0000-000000001530';
const ACC_OFFICE = '00000000-0000-0000-0000-000000001540';
const ACC_DEPR = '00000000-0000-0000-0000-000000001550';
const ACC_INS = '00000000-0000-0000-0000-000000001560';
const ACC_MKT = '00000000-0000-0000-0000-000000001570';
const ACC_TRAVEL = '00000000-0000-0000-0000-000000001580';
const ACC_MISC = '00000000-0000-0000-0000-000000001590';

// ─── Customers ────────────────────────────────────────────────────────────────
const CUST_1 = '00000000-0000-0000-0000-000000002000';
const CUST_2 = '00000000-0000-0000-0000-000000002000';
const CUST_3 = '00000000-0000-0000-0000-000000002000';
const CUST_4 = '00000000-0000-0000-0000-000000002000';
const CUST_5 = '00000000-0000-0000-0000-000000002000';

// ─── Vendors ──────────────────────────────────────────────────────────────────
const VEND_1 = '00000000-0000-0000-0000-000000003000';
const VEND_2 = '00000000-0000-0000-0000-000000003000';
const VEND_3 = '00000000-0000-0000-0000-000000003000';
const VEND_4 = '00000000-0000-0000-0000-000000003000';
const VEND_5 = '00000000-0000-0000-0000-000000003000';

// ─── Bank Accounts ────────────────────────────────────────────────────────────
const BANK_1 = '00000000-0000-0000-0000-000000004000';
const BANK_2 = '00000000-0000-0000-0000-000000004000';
const BANK_3 = '00000000-0000-0000-0000-000000004000';

// ─── Items ────────────────────────────────────────────────────────────────────
const ITEM_1 = '00000000-0000-0000-0000-000000005000';
const ITEM_2 = '00000000-0000-0000-0000-000000005000';
const ITEM_3 = '00000000-0000-0000-0000-000000005000';
const ITEM_4 = '00000000-0000-0000-0000-000000005000';
const ITEM_5 = '00000000-0000-0000-0000-000000005000';
const ITEM_6 = '00000000-0000-0000-0000-000000005000';
const ITEM_7 = '00000000-0000-0000-0000-000000005000';
const ITEM_8 = '00000000-0000-0000-0000-000000005000';
const ITEM_9 = '00000000-0000-0000-0000-000000005000';
const ITEM_10 = '00000000-0000-0000-0000-000000005001';

// ─── Warehouses ───────────────────────────────────────────────────────────────
const WH_1 = '00000000-0000-0000-0000-000000006000';
const WH_2 = '00000000-0000-0000-0000-000000006000';

// ─── Employees ────────────────────────────────────────────────────────────────
const EMP_1 = '00000000-0000-0000-0000-000000007000';
const EMP_2 = '00000000-0000-0000-0000-000000007000';
const EMP_3 = '00000000-0000-0000-0000-000000007000';
const EMP_4 = '00000000-0000-0000-0000-000000007000';
const EMP_5 = '00000000-0000-0000-0000-000000007000';
const EMP_6 = '00000000-0000-0000-0000-000000007000';
const EMP_7 = '00000000-0000-0000-0000-000000007000';
const EMP_8 = '00000000-0000-0000-0000-000000007000';

// ─── Invoices ─────────────────────────────────────────────────────────────────
const INV_1 = '00000000-0000-0000-0000-000000008000';
const INV_2 = '00000000-0000-0000-0000-000000008000';
const INV_3 = '00000000-0000-0000-0000-000000008000';
const INV_4 = '00000000-0000-0000-0000-000000008000';
const INV_5 = '00000000-0000-0000-0000-000000008000';
const INV_6 = '00000000-0000-0000-0000-000000008000';
const INV_7 = '00000000-0000-0000-0000-000000008000';
const INV_8 = '00000000-0000-0000-0000-000000008000';

// ─── Payments (AR) ────────────────────────────────────────────────────────────
const PAY_1 = '00000000-0000-0000-0000-000000009000';
const PAY_2 = '00000000-0000-0000-0000-000000009000';
const PAY_3 = '00000000-0000-0000-0000-000000009000';
const PAY_4 = '00000000-0000-0000-0000-000000009000';
const PAY_5 = '00000000-0000-0000-0000-000000009000';

// ─── Bills ────────────────────────────────────────────────────────────────────
const BILL_1 = '00000000-0000-0000-0000-00000000a000';
const BILL_2 = '00000000-0000-0000-0000-00000000a000';
const BILL_3 = '00000000-0000-0000-0000-00000000a000';
const BILL_4 = '00000000-0000-0000-0000-00000000a000';
const BILL_5 = '00000000-0000-0000-0000-00000000a000';
const BILL_6 = '00000000-0000-0000-0000-00000000a000';

// ─── Vendor Payments ──────────────────────────────────────────────────────────
const VPAY_1 = '00000000-0000-0000-0000-00000000b000';
const VPAY_2 = '00000000-0000-0000-0000-00000000b000';
const VPAY_3 = '00000000-0000-0000-0000-00000000b000';
const VPAY_4 = '00000000-0000-0000-0000-00000000b000';

// ─── Purchase Orders ──────────────────────────────────────────────────────────
const PO_1 = '00000000-0000-0000-0000-00000000c000';
const PO_2 = '00000000-0000-0000-0000-00000000c000';
const PO_3 = '00000000-0000-0000-0000-00000000c000';

// ─── Receiving Reports ────────────────────────────────────────────────────────
const RR_1 = '00000000-0000-0000-0000-00000000c100';
const RR_2 = '00000000-0000-0000-0000-00000000c100';

// ─── Sales Orders ─────────────────────────────────────────────────────────────
const SO_1 = '00000000-0000-0000-0000-00000000d000';
const SO_2 = '00000000-0000-0000-0000-00000000d000';
const SO_3 = '00000000-0000-0000-0000-00000000d000';
const SO_4 = '00000000-0000-0000-0000-00000000d000';

// ─── Quotations ───────────────────────────────────────────────────────────────
const QT_1 = '00000000-0000-0000-0000-00000000e000';
const QT_2 = '00000000-0000-0000-0000-00000000e000';
const QT_3 = '00000000-0000-0000-0000-00000000e000';

// ─── Credit Notes ─────────────────────────────────────────────────────────────
const CN_1 = '00000000-0000-0000-0000-00000000f000';
const CN_2 = '00000000-0000-0000-0000-00000000f000';
const CN_3 = '00000000-0000-0000-0000-00000000f000';

// ─── Departments ──────────────────────────────────────────────────────────────
const DEPT_HR = '00000000-0000-0000-0000-000000007100';
const DEPT_FIN = '00000000-0000-0000-0000-000000007100';
const DEPT_OPS = '00000000-0000-0000-0000-000000007100';
const DEPT_SALES = '00000000-0000-0000-0000-000000007100';
const DEPT_IT = '00000000-0000-0000-0000-000000007100';

// ─── Designations ─────────────────────────────────────────────────────────────
const DESIG_CEO = '00000000-0000-0000-0000-000000007200';
const DESIG_DIR = '00000000-0000-0000-0000-000000007200';
const DESIG_MGR = '00000000-0000-0000-0000-000000007200';
const DESIG_SR = '00000000-0000-0000-0000-000000007200';
const DESIG_JR = '00000000-0000-0000-0000-000000007200';
const DESIG_INT = '00000000-0000-0000-0000-000000007200';

// ─── Leave Types ──────────────────────────────────────────────────────────────
const LEAVE_SICK = '00000000-0000-0000-0000-000000007300';
const LEAVE_VAC = '00000000-0000-0000-0000-000000007300';
const LEAVE_PERSONAL = '00000000-0000-0000-0000-000000007300';
const LEAVE_MAT = '00000000-0000-0000-0000-000000007300';
const LEAVE_UNPAID = '00000000-0000-0000-0000-000000007300';

// ─── Asset Categories ─────────────────────────────────────────────────────────
const ACAT_1 = '00000000-0000-0000-0000-00000000a100';
const ACAT_2 = '00000000-0000-0000-0000-00000000a100';
const ACAT_3 = '00000000-0000-0000-0000-00000000a100';

// ─── Fixed Assets ─────────────────────────────────────────────────────────────
const ASSET_1 = '00000000-0000-0000-0000-00000000a200';
const ASSET_2 = '00000000-0000-0000-0000-00000000a200';
const ASSET_3 = '00000000-0000-0000-0000-00000000a200';
const ASSET_4 = '00000000-0000-0000-0000-00000000a200';
const ASSET_5 = '00000000-0000-0000-0000-00000000a200';

// ─── Depreciation Schedules ───────────────────────────────────────────────────
const DSCH_1 = '00000000-0000-0000-0000-00000000a300';
const DSCH_2 = '00000000-0000-0000-0000-00000000a300';
const DSCH_3 = '00000000-0000-0000-0000-00000000a300';
const DSCH_4 = '00000000-0000-0000-0000-00000000a300';
const DSCH_5 = '00000000-0000-0000-0000-00000000a300';

// ─── Tax Codes ────────────────────────────────────────────────────────────────
const TCODE_GST = '00000000-0000-0000-0000-00000000a400';
const TCODE_VAT = '00000000-0000-0000-0000-00000000a400';
const TCODE_WHT = '00000000-0000-0000-0000-00000000a400';

// ─── Tax Rates ────────────────────────────────────────────────────────────────
const TRATE_1 = '00000000-0000-0000-0000-00000000a500';
const TRATE_2 = '00000000-0000-0000-0000-00000000a500';
const TRATE_3 = '00000000-0000-0000-0000-00000000a500';
const TRATE_4 = '00000000-0000-0000-0000-00000000a500';

// ─── Budget Headers ───────────────────────────────────────────────────────────
const BHDR_1 = '00000000-0000-0000-0000-00000000a600';
const BHDR_2 = '00000000-0000-0000-0000-00000000a600';

// ─── Budget Lines ─────────────────────────────────────────────────────────────
const BLINE_1 = '00000000-0000-0000-0000-00000000a700';
const BLINE_2 = '00000000-0000-0000-0000-00000000a700';
const BLINE_3 = '00000000-0000-0000-0000-00000000a700';
const BLINE_4 = '00000000-0000-0000-0000-00000000a700';
const BLINE_5 = '00000000-0000-0000-0000-00000000a700';
const BLINE_6 = '00000000-0000-0000-0000-00000000a700';

// ─── Report Templates ─────────────────────────────────────────────────────────
const RTPL_1 = '00000000-0000-0000-0000-00000000a800';
const RTPL_2 = '00000000-0000-0000-0000-00000000a800';

// ─── Reports ──────────────────────────────────────────────────────────────────
const RPT_1 = '00000000-0000-0000-0000-00000000a900';
const RPT_2 = '00000000-0000-0000-0000-00000000a900';

// ─── Item Categories (kept from existing) ─────────────────────────────────────
const ICAT_ELEC = '00000000-0000-0000-0000-000000005100';
const ICAT_OFF = '00000000-0000-0000-0000-000000005100';
const ICAT_FURN = '00000000-0000-0000-0000-000000005100';
const ICAT_RAW = '00000000-0000-0000-0000-000000005100';
const ICAT_FG = '00000000-0000-0000-0000-000000005100';

// ─── UoMs (kept from existing) ────────────────────────────────────────────────
const UOM_EA = '00000000-0000-0000-0000-000000006100';
const UOM_KG = '00000000-0000-0000-0000-000000006100';
const UOM_G = '00000000-0000-0000-0000-000000006100';
const UOM_LB = '00000000-0000-0000-0000-000000006100';
const UOM_L = '00000000-0000-0000-0000-000000006100';
const UOM_ML = '00000000-0000-0000-0000-000000006100';
const UOM_M = '00000000-0000-0000-0000-000000006100';
const UOM_CM = '00000000-0000-0000-0000-000000006100';
const UOM_FT = '00000000-0000-0000-0000-000000006100';
const UOM_SQM = '00000000-0000-0000-0000-000000006101';
const UOM_BOX = '00000000-0000-0000-0000-000000006101';
const UOM_PCS = '00000000-0000-0000-0000-000000006101';

// ─── Currency IDs ─────────────────────────────────────────────────────────────
const CUR_USD = '00000000-0000-0000-0000-000000004100';
const CUR_EUR = '00000000-0000-0000-0000-000000004100';
const CUR_GBP = '00000000-0000-0000-0000-000000004100';
const CUR_PKR = '00000000-0000-0000-0000-000000004100';
const CUR_JPY = '00000000-0000-0000-0000-000000004100';

// ─── Fiscal Year ──────────────────────────────────────────────────────────────
const FY_2026 = '00000000-0000-0000-0000-000000001600';

// ─── Bank Transfers ───────────────────────────────────────────────────────────
const BT_1 = '00000000-0000-0000-0000-000000004200';
const BT_2 = '00000000-0000-0000-0000-000000004200';

// ─── Permission IDs ───────────────────────────────────────────────────────────
const PERM_1 = '00000000-0000-0000-0000-000000000020';
const PERM_2 = '00000000-0000-0000-0000-000000000020';
const PERM_3 = '00000000-0000-0000-0000-000000000020';
const PERM_4 = '00000000-0000-0000-0000-000000000020';
const PERM_5 = '00000000-0000-0000-0000-000000000020';
const PERM_6 = '00000000-0000-0000-0000-000000000020';
const PERM_7 = '00000000-0000-0000-0000-000000000020';
const PERM_8 = '00000000-0000-0000-0000-000000000020';
const PERM_9 = '00000000-0000-0000-0000-000000000020';

// ─── User Role IDs ────────────────────────────────────────────────────────────
const UR_1 = '00000000-0000-0000-0000-000000000030';
const UR_2 = '00000000-0000-0000-0000-000000000031';
const UR_3 = '00000000-0000-0000-0000-000000000032';

// =============================================================================
// Seed
// =============================================================================

async function seed() {
  console.log('Seeding database...');

  // ─── BC-AUTH: Roles ───────────────────────────────────────────────────────
  await sql`
    INSERT INTO roles (id, tenant_id, name, description, is_system, created_at, updated_at)
    VALUES
      (${ROLE_ADMIN}, ${T}, 'Admin', 'Full system administrator', true, NOW(), NOW()),
      (${ROLE_MGR}, ${T}, 'Manager', 'Department manager with elevated permissions', true, NOW(), NOW()),
      (${ROLE_USER}, ${T}, 'User', 'Standard user with basic permissions', true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Roles: Admin, Manager, User');
  // ─── BC-AUTH: Users ───────────────────────────────────────────────────────
  await sql`
    INSERT INTO users (id, tenant_id, email, name, username, status, email_verified, mfa_enabled, created_at, updated_at)
    VALUES
      (${ADMIN}, ${T}, 'admin@lumora.app', 'System Admin', 'admin', 'active', true, false, NOW(), NOW()),
      (${MANAGER}, ${T}, 'manager@lumora.app', 'Jane Manager', 'jane.manager', 'active', true, false, NOW(), NOW()),
      (${USER}, ${T}, 'user@lumora.app', 'John User', 'john.user', 'active', true, false, NOW(), NOW()),
      (${DEV}, ${T}, 'dev@lumora.app', 'Dev User', 'dev', 'active', true, false, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Users: admin@lumora.app, manager@lumora.app, user@lumora.app, dev@lumora.app');
  // ─── BC-AUTH: User Roles ──────────────────────────────────────────────────
  await sql`
    INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
    VALUES
      (${UR_1}, ${ADMIN}, ${ROLE_ADMIN}, NOW(), NOW()),
      (${UR_2}, ${MANAGER}, ${ROLE_MGR}, NOW(), NOW()),
      (${UR_3}, ${USER}, ${ROLE_USER}, NOW(), NOW()),
      ('00000000-0000-0000-0000-000000000033', ${DEV}, ${ROLE_ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  User roles assigned');
  // ─── BC-AUTH: Credentials (password hashes for login) ──────────────────────
  const DEV_PASSWORD_HASH = 's2:bf6897d60422b84c96e432dc4f9404e5:a0c4eb1e22135da7844c711028a0e1c1529e1d3d5fb10e30c37c5b0f3dd58832';
  await sql`
    INSERT INTO credentials (id, tenant_id, user_id, password_hash, provider, created_at, updated_at)
    VALUES
      ('00000000-0000-0000-0000-000000000040', ${T}, ${DEV}, ${DEV_PASSWORD_HASH}, 'email', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Credentials: dev@lumora.app / 123456');
  // ─── BC-AUTH: Permissions ─────────────────────────────────────────────────
  await sql`
    INSERT INTO permissions (id, tenant_id, role_id, resource, action, created_at, updated_at)
    VALUES
      (${PERM_1}, ${T}, ${ROLE_ADMIN}, '*', '*', NOW(), NOW()),
      (${PERM_2}, ${T}, ${ROLE_MGR}, 'invoices', 'create', NOW(), NOW()),
      (${PERM_3}, ${T}, ${ROLE_MGR}, 'invoices', 'read', NOW(), NOW()),
      (${PERM_4}, ${T}, ${ROLE_MGR}, 'invoices', 'update', NOW(), NOW()),
      (${PERM_5}, ${T}, ${ROLE_MGR}, 'reports', 'read', NOW(), NOW()),
      (${PERM_6}, ${T}, ${ROLE_USER}, 'invoices', 'read', NOW(), NOW()),
      (${PERM_7}, ${T}, ${ROLE_USER}, 'reports', 'read', NOW(), NOW()),
      (${PERM_8}, ${T}, ${ROLE_USER}, 'items', 'read', NOW(), NOW()),
      (${PERM_9}, ${T}, ${ROLE_USER}, 'items', 'update', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Permissions: 9 permission rules');
  // ─── BC-FIN: Chart of Accounts ────────────────────────────────────────────
  await sql`
    INSERT INTO accounts (id, tenant_id, code, name, type, balance, is_active, created_at, updated_at)
    VALUES
      (${ACC_CASH}, ${T}, '1000', 'Cash', 'asset', '0', true, NOW(), NOW()),
      (${ACC_PETTY}, ${T}, '1010', 'Petty Cash', 'asset', '0', true, NOW(), NOW()),
      (${ACC_AR}, ${T}, '1100', 'Accounts Receivable', 'asset', '0', true, NOW(), NOW()),
      (${ACC_INV}, ${T}, '1200', 'Inventory', 'asset', '0', true, NOW(), NOW()),
      (${ACC_PREPAID}, ${T}, '1300', 'Prepaid Expenses', 'asset', '0', true, NOW(), NOW()),
      (${ACC_FIXED}, ${T}, '1500', 'Fixed Assets', 'asset', '0', true, NOW(), NOW()),
      (${ACC_ACCDEPR}, ${T}, '1510', 'Accumulated Depreciation', 'asset', '0', true, NOW(), NOW()),
      (${ACC_AP}, ${T}, '2000', 'Accounts Payable', 'liability', '0', true, NOW(), NOW()),
      (${ACC_ACCRUED}, ${T}, '2100', 'Accrued Expenses', 'liability', '0', true, NOW(), NOW()),
      (${ACC_SALESTAX}, ${T}, '2200', 'Sales Tax Payable', 'liability', '0', true, NOW(), NOW()),
      (${ACCINCTAX}, ${T}, '2300', 'Income Tax Payable', 'liability', '0', true, NOW(), NOW()),
      (${ACC_LTLIAB}, ${T}, '2500', 'Long-term Liabilities', 'liability', '0', true, NOW(), NOW()),
      (${ACC_OWNERS}, ${T}, '3000', 'Owner''s Equity', 'equity', '0', true, NOW(), NOW()),
      (${ACC_RETAIN}, ${T}, '3100', 'Retained Earnings', 'equity', '0', true, NOW(), NOW()),
      (${ACC_CURR}, ${T}, '3200', 'Current Year Earnings', 'equity', '0', true, NOW(), NOW()),
      (${ACC_SALES}, ${T}, '4000', 'Sales Revenue', 'revenue', '0', true, NOW(), NOW()),
      (${ACC_SVC}, ${T}, '4100', 'Service Revenue', 'revenue', '0', true, NOW(), NOW()),
      (${ACC_INT}, ${T}, '4200', 'Interest Income', 'revenue', '0', true, NOW(), NOW()),
      (${ACC_OTHINC}, ${T}, '4300', 'Other Income', 'revenue', '0', true, NOW(), NOW()),
      (${ACC_COGS}, ${T}, '5000', 'Cost of Goods Sold', 'expense', '0', true, NOW(), NOW()),
      (${ACC_SALARY}, ${T}, '5100', 'Salary Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_RENT}, ${T}, '5200', 'Rent Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_UTIL}, ${T}, '5300', 'Utilities Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_OFFICE}, ${T}, '5400', 'Office Supplies', 'expense', '0', true, NOW(), NOW()),
      (${ACC_DEPR}, ${T}, '5500', 'Depreciation Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_INS}, ${T}, '5600', 'Insurance Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_MKT}, ${T}, '5700', 'Marketing Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_TRAVEL}, ${T}, '5800', 'Travel Expense', 'expense', '0', true, NOW(), NOW()),
      (${ACC_MISC}, ${T}, '5900', 'Miscellaneous Expense', 'expense', '0', true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Chart of Accounts: 29 accounts');
  // ─── BC-FIN: Fiscal Year ──────────────────────────────────────────────────
  await sql`
    INSERT INTO fiscal_years (id, tenant_id, name, start_date, end_date, status, created_at, updated_at)
    VALUES (${FY_2026}, ${T}, 'FY 2026', '2026-01-01', '2026-12-31', 'open', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Fiscal Year: FY 2026');
  // ─── BC-CASH: Currencies ──────────────────────────────────────────────────
  await sql`
    INSERT INTO currencies (id, code, name, symbol, decimal_places, is_active, created_at, updated_at)
    VALUES
      (${CUR_USD}, 'USD', 'US Dollar', '$', 2, true, NOW(), NOW()),
      (${CUR_EUR}, 'EUR', 'Euro', '€', 2, true, NOW(), NOW()),
      (${CUR_GBP}, 'GBP', 'British Pound', '£', 2, true, NOW(), NOW()),
      (${CUR_PKR}, 'PKR', 'Pakistani Rupee', 'Rs', 2, true, NOW(), NOW()),
      (${CUR_JPY}, 'JPY', 'Japanese Yen', '¥', 0, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Currencies: USD, EUR, GBP, PKR, JPY');
  // ─── BC-CASH: Bank Accounts ───────────────────────────────────────────────
  await sql`
    INSERT INTO bank_accounts (id, tenant_id, bank_name, account_name, account_number, routing_number, account_type, currency_code, current_balance, available_balance, status, is_default, created_at, updated_at)
    VALUES
      (${BANK_1}, ${T}, 'Chase Bank', 'Operating Checking', '****4567', '021000021', 'checking', 'USD', 125000.0000, 120000.0000, 'active', true, NOW(), NOW()),
      (${BANK_2}, ${T}, 'Bank of America', 'Savings Reserve', '****8901', '026009593', 'savings', 'USD', 250000.0000, 250000.0000, 'active', false, NOW(), NOW()),
      (${BANK_3}, ${T}, 'Wells Fargo', 'Petty Cash', '****2345', '121000248', 'checking', 'USD', 5000.0000, 5000.0000, 'active', false, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Bank Accounts: 3 accounts');
  // ─── BC-INV: Units of Measure ─────────────────────────────────────────────
  await sql`
    INSERT INTO unit_of_measures (id, code, name, category, decimal_places, created_at, updated_at)
    VALUES
      (${UOM_EA}, 'EA', 'Each', 'count', 0, NOW(), NOW()),
      (${UOM_KG}, 'KG', 'Kilogram', 'weight', 2, NOW(), NOW()),
      (${UOM_G}, 'G', 'Gram', 'weight', 2, NOW(), NOW()),
      (${UOM_LB}, 'LB', 'Pound', 'weight', 2, NOW(), NOW()),
      (${UOM_L}, 'L', 'Liter', 'volume', 2, NOW(), NOW()),
      (${UOM_ML}, 'ML', 'Milliliter', 'volume', 2, NOW(), NOW()),
      (${UOM_M}, 'M', 'Meter', 'length', 2, NOW(), NOW()),
      (${UOM_CM}, 'CM', 'Centimeter', 'length', 2, NOW(), NOW()),
      (${UOM_FT}, 'FT', 'Foot', 'length', 2, NOW(), NOW()),
      (${UOM_SQM}, 'SQM', 'Square Meter', 'area', 2, NOW(), NOW()),
      (${UOM_BOX}, 'BOX', 'Box', 'count', 0, NOW(), NOW()),
      (${UOM_PCS}, 'PCS', 'Pieces', 'count', 0, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Units of Measure: 12 UoMs');
  // ─── BC-INV: Item Categories ──────────────────────────────────────────────
  await sql`
    INSERT INTO item_categories (id, tenant_id, name, code, description, is_active, created_at, updated_at)
    VALUES
      (${ICAT_ELEC}, ${T}, 'Electronics', 'ELEC', 'Electronic devices and components', true, NOW(), NOW()),
      (${ICAT_OFF}, ${T}, 'Office Supplies', 'OFF', 'Office consumables and stationery', true, NOW(), NOW()),
      (${ICAT_FURN}, ${T}, 'Furniture', 'FURN', 'Office furniture and fixtures', true, NOW(), NOW()),
      (${ICAT_RAW}, ${T}, 'Raw Materials', 'RAW', 'Raw materials for production', true, NOW(), NOW()),
      (${ICAT_FG}, ${T}, 'Finished Goods', 'FG', 'Ready-to-sell products', true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Item Categories: 5 categories');
  // ─── BC-INV: Items ────────────────────────────────────────────────────────
  await sql`
    INSERT INTO items (id, tenant_id, sku, name, description, category_id, unit_of_measure_id, is_active, is_serialized, is_lot_tracked, reorder_point, reorder_optimal_quantity, reorder_lead_time_days, reorder_safety_stock, cost_method, created_by, created_at, updated_at)
    VALUES
      (${ITEM_1}, ${T}, 'ELEC-001', 'Laptop Dell XPS 15', 'Dell XPS 15 9530, 16GB RAM, 512GB SSD', ${ICAT_ELEC}, ${UOM_EA}, true, true, false, 5, 10, 7, 2, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_2}, ${T}, 'ELEC-002', 'Wireless Mouse Logitech', 'Logitech MX Master 3S wireless mouse', ${ICAT_ELEC}, ${UOM_EA}, true, false, false, 20, 50, 3, 10, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_3}, ${T}, 'ELEC-003', 'USB-C Hub 7-in-1', 'Multi-port USB-C adapter with HDMI', ${ICAT_ELEC}, ${UOM_EA}, true, false, false, 15, 30, 5, 5, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_4}, ${T}, 'OFF-001', 'A4 Copy Paper 500 sheets', 'Premium white A4 paper 80gsm', ${ICAT_OFF}, ${UOM_BOX}, true, false, false, 10, 25, 2, 5, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_5}, ${T}, 'OFF-002', 'Ballpoint Pens Blue (Box)', 'Standard blue ballpoint pens pack of 50', ${ICAT_OFF}, ${UOM_BOX}, true, false, false, 10, 20, 2, 5, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_6}, ${T}, 'FURN-001', 'Ergonomic Office Chair', 'Adjustable lumbar support, mesh back', ${ICAT_FURN}, ${UOM_EA}, true, false, false, 3, 8, 14, 2, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_7}, ${T}, 'FURN-002', 'Standing Desk Electric', 'Height-adjustable electric standing desk 120cm', ${ICAT_FURN}, ${UOM_EA}, true, false, false, 2, 5, 14, 1, 'weighted_average', ${ADMIN}, NOW(), NOW()),
      (${ITEM_8}, ${T}, 'RAW-001', 'Steel Sheets 2mm', 'Cold-rolled steel sheets 1m x 2m', ${ICAT_RAW}, ${UOM_PCS}, true, false, true, 50, 100, 10, 20, 'fifo', ${ADMIN}, NOW(), NOW()),
      (${ITEM_9}, ${T}, 'FG-001', 'Custom Metal Bracket', 'CNC-machined steel bracket assembly', ${ICAT_FG}, ${UOM_EA}, true, true, true, 100, 250, 5, 50, 'fifo', ${ADMIN}, NOW(), NOW()),
      (${ITEM_10}, ${T}, 'ELEC-004', '4K Monitor 27"', 'LG 27UK850-W 4K UHD IPS monitor', ${ICAT_ELEC}, ${UOM_EA}, true, true, false, 5, 10, 7, 2, 'weighted_average', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Items: 10 items');
  // ─── BC-INV: Warehouses ───────────────────────────────────────────────────
  await sql`
    INSERT INTO warehouses (id, tenant_id, name, code, address_line1, city, state, postal_code, country, is_active, is_default, created_at, updated_at)
    VALUES
      (${WH_1}, ${T}, 'Main Warehouse', 'WH-MAIN', '100 Industrial Blvd', 'Houston', 'TX', '77001', 'USA', true, true, NOW(), NOW()),
      (${WH_2}, ${T}, 'East Coast Distribution', 'WH-EAST', '250 Commerce Dr', 'Newark', 'NJ', '07102', 'USA', true, false, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Warehouses: 2 warehouses');
  // ─── BC-INV: Stock Levels ─────────────────────────────────────────────────
  await sql`
    INSERT INTO stock_levels (id, tenant_id, item_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available, quantity_on_order, last_movement_at, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${T}, ${ITEM_1}, ${WH_1}, 25, 3, 22, 5, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_2}, ${WH_1}, 150, 10, 140, 0, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_3}, ${WH_1}, 80, 5, 75, 20, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_4}, ${WH_1}, 60, 0, 60, 0, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_5}, ${WH_1}, 40, 0, 40, 0, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_6}, ${WH_2}, 12, 2, 10, 3, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_7}, ${WH_2}, 8, 1, 7, 2, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_8}, ${WH_1}, 300, 20, 280, 0, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_9}, ${WH_1}, 450, 50, 400, 100, NOW(), NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_10}, ${WH_2}, 15, 2, 13, 5, NOW(), NOW(), NOW())
    ON CONFLICT (item_id, warehouse_id) DO NOTHING
  `;
  console.log('  Stock Levels: 10 entries');
  // ─── BC-INV: Stock Movements ──────────────────────────────────────────────
  await sql`
    INSERT INTO stock_movements (id, tenant_id, item_id, warehouse_id, movement_type, quantity, source_document_type, source_document_id, unit_cost, total_cost, reason, movement_date, created_by, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${T}, ${ITEM_1}, ${WH_1}, 'inbound', 30, 'purchase_order', ${PO_1}, 1200.0000, 36000.0000, 'Initial stock from PO-001', '2026-01-15', ${ADMIN}, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_1}, ${WH_1}, 'outbound', -5, 'sales_order', ${SO_1}, 1200.0000, -6000.0000, 'Fulfilled SO-001', '2026-02-01', ${ADMIN}, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_8}, ${WH_1}, 'inbound', 100, 'purchase_order', ${PO_2}, 45.0000, 4500.0000, 'Steel sheets from PO-002', '2026-01-20', ${ADMIN}, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_9}, ${WH_1}, 'outbound', -20, 'sales_order', ${SO_2}, 85.0000, -1700.0000, 'Fulfilled SO-002', '2026-02-10', ${ADMIN}, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${ITEM_2}, ${WH_1}, 'adjustment', 10, 'inventory_count', ${ITEM_2}, 25.0000, 250.0000, 'Found during cycle count', '2026-03-01', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Stock Movements: 5 movements');
  // ─── BC-HR: Departments ───────────────────────────────────────────────────
  await sql`
    INSERT INTO departments (id, tenant_id, name, code, description, status, created_at, updated_at)
    VALUES
      (${DEPT_HR}, ${T}, 'Human Resources', 'HR', 'Human resources and people operations', 'active', NOW(), NOW()),
      (${DEPT_FIN}, ${T}, 'Finance', 'FIN', 'Financial operations and accounting', 'active', NOW(), NOW()),
      (${DEPT_OPS}, ${T}, 'Operations', 'OPS', 'Business operations and logistics', 'active', NOW(), NOW()),
      (${DEPT_SALES}, ${T}, 'Sales', 'SALES', 'Sales and business development', 'active', NOW(), NOW()),
      (${DEPT_IT}, ${T}, 'Information Technology', 'IT', 'Technology infrastructure and development', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Departments: HR, Finance, Operations, Sales, IT');
  // ─── BC-HR: Designations ──────────────────────────────────────────────────
  await sql`
    INSERT INTO designations (id, tenant_id, name, code, level, salary_band_min, salary_band_max, is_active, created_at, updated_at)
    VALUES
      (${DESIG_CEO}, ${T}, 'CEO', 'CEO', 10, 150000, 300000, true, NOW(), NOW()),
      (${DESIG_DIR}, ${T}, 'Director', 'DIR', 8, 100000, 200000, true, NOW(), NOW()),
      (${DESIG_MGR}, ${T}, 'Manager', 'MGR', 6, 70000, 120000, true, NOW(), NOW()),
      (${DESIG_SR}, ${T}, 'Senior', 'SR', 4, 50000, 90000, true, NOW(), NOW()),
      (${DESIG_JR}, ${T}, 'Junior', 'JR', 2, 30000, 60000, true, NOW(), NOW()),
      (${DESIG_INT}, ${T}, 'Intern', 'INT', 1, 15000, 30000, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Designations: CEO, Director, Manager, Senior, Junior, Intern');
  // ─── BC-HR: Employees ─────────────────────────────────────────────────────
  await sql`
    INSERT INTO employees (id, tenant_id, user_id, first_name, last_name, email, phone, hire_date, department_id, designation_id, manager_id, employment_type, status, created_at, updated_at)
    VALUES
      (${EMP_1}, ${T}, ${ADMIN}, 'Alice', 'Admin', 'alice.admin@lumora.app', '+1-555-1001', '2024-01-15', ${DEPT_IT}, ${DESIG_DIR}, NULL, 'full_time', 'active', NOW(), NOW()),
      (${EMP_2}, ${T}, ${MANAGER}, 'Jane', 'Manager', 'jane.manager@lumora.app', '+1-555-1002', '2024-03-01', ${DEPT_FIN}, ${DESIG_MGR}, ${EMP_1}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_3}, ${T}, NULL, 'Bob', 'Johnson', 'bob.johnson@lumora.app', '+1-555-1003', '2024-06-15', ${DEPT_SALES}, ${DESIG_SR}, ${EMP_2}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_4}, ${T}, NULL, 'Sarah', 'Williams', 'sarah.williams@lumora.app', '+1-555-1004', '2025-01-10', ${DEPT_OPS}, ${DESIG_MGR}, ${EMP_1}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_5}, ${T}, NULL, 'Mike', 'Chen', 'mike.chen@lumora.app', '+1-555-1005', '2025-03-20', ${DEPT_IT}, ${DESIG_JR}, ${EMP_1}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_6}, ${T}, NULL, 'Lisa', 'Patel', 'lisa.patel@lumora.app', '+1-555-1006', '2025-06-01', ${DEPT_HR}, ${DESIG_SR}, ${EMP_2}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_7}, ${T}, NULL, 'Tom', 'Brown', 'tom.brown@lumora.app', '+1-555-1007', '2025-09-01', ${DEPT_SALES}, ${DESIG_JR}, ${EMP_3}, 'full_time', 'active', NOW(), NOW()),
      (${EMP_8}, ${T}, NULL, 'Emma', 'Davis', 'emma.davis@lumora.app', '+1-555-1008', '2026-01-15', ${DEPT_FIN}, ${DESIG_INT}, ${EMP_2}, 'intern', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Employees: 8 employees');
  // ─── BC-HR: Leave Types ───────────────────────────────────────────────────
  await sql`
    INSERT INTO leave_types (id, tenant_id, name, code, days_per_year, is_paid, carry_forward, is_active, created_at, updated_at)
    VALUES
      (${LEAVE_SICK}, ${T}, 'Sick Leave', 'SICK', 12, true, false, true, NOW(), NOW()),
      (${LEAVE_VAC}, ${T}, 'Vacation', 'VAC', 20, true, true, true, NOW(), NOW()),
      (${LEAVE_PERSONAL}, ${T}, 'Personal Leave', 'PERS', 5, true, false, true, NOW(), NOW()),
      (${LEAVE_MAT}, ${T}, 'Maternity Leave', 'MAT', 90, true, false, true, NOW(), NOW()),
      (${LEAVE_UNPAID}, ${T}, 'Unpaid Leave', 'UNPD', 30, false, false, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Leave Types: 5 types');
  // ─── BC-AR: Customers ─────────────────────────────────────────────────────
  await sql`
    INSERT INTO customers (id, tenant_id, name, email, phone, address_line1, city, state, postal_code, country, payment_terms, credit_limit, is_active, created_at, updated_at)
    VALUES
      (${CUST_1}, ${T}, 'Acme Corporation', 'billing@acme.com', '+1-555-0101', '500 Tech Park Drive', 'San Francisco', 'CA', '94105', 'USA', 'Net 30', 50000, true, NOW(), NOW()),
      (${CUST_2}, ${T}, 'Globex Industries', 'ap@globex.com', '+1-555-0102', '1200 Innovation Way', 'Austin', 'TX', '73301', 'USA', 'Net 45', 75000, true, NOW(), NOW()),
      (${CUST_3}, ${T}, 'Initech Solutions', 'finance@initech.com', '+1-555-0103', '800 Corporate Blvd', 'Chicago', 'IL', '60601', 'USA', 'Net 30', 30000, true, NOW(), NOW()),
      (${CUST_4}, ${T}, 'Wayne Enterprises', 'payments@wayne.com', '+1-555-0104', '1007 Gotham Plaza', 'Gotham', 'NJ', '07001', 'USA', 'Net 60', 100000, true, NOW(), NOW()),
      (${CUST_5}, ${T}, 'Stark Industries', 'accounting@stark.com', '+1-555-0105', '200 Pepper Tower', 'New York', 'NY', '10001', 'USA', 'Net 30', 80000, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Customers: 5 customers');
  // ─── BC-AR: Invoices ──────────────────────────────────────────────────────
  await sql`
    INSERT INTO invoices (id, tenant_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, balance_due, currency, notes, created_at, updated_at)
    VALUES
      (${INV_1}, ${T}, ${CUST_1}, 'INV-2026-0001', 'paid', '2026-01-15', '2026-02-14', 5000.0000, 400.0000, 5400.0000, 5400.0000, 0, 'USD', 'Laptop order for Q1', NOW(), NOW()),
      (${INV_2}, ${T}, ${CUST_2}, 'INV-2026-0002', 'paid', '2026-01-20', '2026-03-06', 12500.0000, 1000.0000, 13500.0000, 13500.0000, 0, 'USD', 'Bulk mouse order', NOW(), NOW()),
      (${INV_3}, ${T}, ${CUST_3}, 'INV-2026-0003', 'sent', '2026-02-01', '2026-03-03', 3200.0000, 256.0000, 3456.0000, 0, 3456.0000, 'USD', 'Office supplies restock', NOW(), NOW()),
      (${INV_4}, ${T}, ${CUST_1}, 'INV-2026-0004', 'sent', '2026-02-15', '2026-03-17', 8400.0000, 672.0000, 9072.0000, 0, 9072.0000, 'USD', 'Monitor and chair order', NOW(), NOW()),
      (${INV_5}, ${T}, ${CUST_4}, 'INV-2026-0005', 'overdue', '2026-01-05', '2026-02-04', 22000.0000, 1760.0000, 23760.0000, 5000.0000, 18760.0000, 'USD', 'Overdue - follow up required', NOW(), NOW()),
      (${INV_6}, ${T}, ${CUST_5}, 'INV-2026-0006', 'draft', '2026-03-01', '2026-03-31', 6750.0000, 540.0000, 7290.0000, 0, 7290.0000, 'USD', 'Pending approval', NOW(), NOW()),
      (${INV_7}, ${T}, ${CUST_2}, 'INV-2026-0007', 'sent', '2026-03-10', '2026-04-09', 4100.0000, 328.0000, 4428.0000, 0, 4428.0000, 'USD', 'Standing desk order', NOW(), NOW()),
      (${INV_8}, ${T}, ${CUST_3}, 'INV-2026-0008', 'paid', '2026-03-15', '2026-04-14', 1800.0000, 144.0000, 1944.0000, 1944.0000, 0, 'USD', 'USB-C hub bulk order', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Invoices: 8 invoices');
  // ─── BC-AR: Invoice Line Items ────────────────────────────────────────────
  await sql`
    INSERT INTO invoice_line_items (id, tenant_id, invoice_id, description, quantity, unit_price, amount, tax_rate, tax_amount, sort_order, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${T}, ${INV_1}, 'Laptop Dell XPS 15', 2, 2400.0000, 4800.0000, 0.0800, 384.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_1}, 'Wireless Mouse Logitech', 2, 100.0000, 200.0000, 0.0800, 16.0000, 2, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_2}, 'Wireless Mouse Logitech', 125, 100.0000, 12500.0000, 0.0800, 1000.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_3}, 'A4 Copy Paper 500 sheets', 40, 45.0000, 1800.0000, 0.0800, 144.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_3}, 'Ballpoint Pens Blue (Box)', 20, 70.0000, 1400.0000, 0.0800, 112.0000, 2, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_4}, '4K Monitor 27"', 2, 3200.0000, 6400.0000, 0.0800, 512.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_4}, 'Ergonomic Office Chair', 2, 1000.0000, 2000.0000, 0.0800, 160.0000, 2, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_5}, 'Laptop Dell XPS 15', 10, 2200.0000, 22000.0000, 0.0800, 1760.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_6}, 'Ergonomic Office Chair', 5, 950.0000, 4750.0000, 0.0800, 380.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_6}, 'Standing Desk Electric', 2, 1000.0000, 2000.0000, 0.0800, 160.0000, 2, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_7}, 'Standing Desk Electric', 4, 1000.0000, 4000.0000, 0.0800, 320.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${INV_8}, 'USB-C Hub 7-in-1', 30, 60.0000, 1800.0000, 0.0800, 144.0000, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Invoice Line Items: 12 line items');
  // ─── BC-AR: Payments ──────────────────────────────────────────────────────
  await sql`
    INSERT INTO payments (id, tenant_id, customer_id, payment_number, payment_date, amount, payment_method, reference_number, bank_account_id, currency, notes, created_at, updated_at)
    VALUES
      (${PAY_1}, ${T}, ${CUST_1}, 'PAY-2026-0001', '2026-02-10', 5400.0000, 'bank_transfer', 'TXN-ACH-78901', ${BANK_1}, 'USD', 'Full payment for INV-2026-0001', NOW(), NOW()),
      (${PAY_2}, ${T}, ${CUST_2}, 'PAY-2026-0002', '2026-03-01', 13500.0000, 'bank_transfer', 'TXN-WIRE-23456', ${BANK_1}, 'USD', 'Full payment for INV-2026-0002', NOW(), NOW()),
      (${PAY_3}, ${T}, ${CUST_4}, 'PAY-2026-0003', '2026-02-20', 5000.0000, 'check', 'CHK-4567', ${BANK_1}, 'USD', 'Partial payment for INV-2026-0005', NOW(), NOW()),
      (${PAY_4}, ${T}, ${CUST_3}, 'PAY-2026-0004', '2026-03-20', 1944.0000, 'online', 'ONLINE-89012', ${BANK_2}, 'USD', 'Full payment for INV-2026-0008', NOW(), NOW()),
      (${PAY_5}, ${T}, ${CUST_1}, 'PAY-2026-0005', '2026-03-25', 2000.0000, 'credit_card', 'CC-VISA-34567', ${BANK_1}, 'USD', 'Partial payment for INV-2026-0004', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Payments: 5 payments');
  // ─── BC-AR: Credit Notes ──────────────────────────────────────────────────
  await sql`
    INSERT INTO credit_notes (id, tenant_id, customer_id, credit_note_number, status, issue_date, reason, amount, amount_applied, balance, currency, notes, created_at, updated_at)
    VALUES
      (${CN_1}, ${T}, ${CUST_1}, 'CN-2026-0001', 'applied', '2026-02-20', 'Damaged laptop returned', 2400.0000, 2400.0000, 0, 'USD', 'Applied to future invoice', NOW(), NOW()),
      (${CN_2}, ${T}, ${CUST_4}, 'CN-2026-0002', 'issued', '2026-03-05', 'Overcharge on previous invoice', 500.0000, 0, 500.0000, 'USD', 'Credit available', NOW(), NOW()),
      (${CN_3}, ${T}, ${CUST_2}, 'CN-2026-0003', 'draft', '2026-03-15', 'Quality issue with mice order', 1000.0000, 0, 1000.0000, 'USD', 'Pending manager approval', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Credit Notes: 3 credit notes');
  // ─── BC-AP: Vendors ───────────────────────────────────────────────────────
  await sql`
    INSERT INTO vendors (id, tenant_id, name, code, tax_id, email, phone, address_line1, city, state, postal_code, country, payment_terms, currency, is_active, created_by, created_at, updated_at)
    VALUES
      (${VEND_1}, ${T}, 'TechSource Global', 'VEND-TSG', '12-3456789', 'orders@techsource.com', '+1-555-0201', '300 Supply Chain Rd', 'Dallas', 'TX', '75201', 'USA', 'Net 30', 'USD', true, ${ADMIN}, NOW(), NOW()),
      (${VEND_2}, ${T}, 'PaperWorks Inc', 'VEND-PWI', '98-7654321', 'sales@paperworks.com', '+1-555-0202', '450 Mill Lane', 'Portland', 'OR', '97201', 'USA', 'Net 15', 'USD', true, ${ADMIN}, NOW(), NOW()),
      (${VEND_3}, ${T}, 'SteelCraft Materials', 'VEND-SCM', '45-6789012', 'procurement@steelcraft.com', '+1-555-0203', '800 Industrial Ave', 'Pittsburgh', 'PA', '15201', 'USA', 'Net 45', 'USD', true, ${ADMIN}, NOW(), NOW()),
      (${VEND_4}, ${T}, 'FurniPro Suppliers', 'VEND-FPS', '67-8901234', 'wholesale@furnipro.com', '+1-555-0204', '550 Furniture Way', 'Grand Rapids', 'MI', '49501', 'USA', 'Net 30', 'USD', true, ${ADMIN}, NOW(), NOW()),
      (${VEND_5}, ${T}, 'OfficeMax Distribution', 'VEND-OMD', '34-5678901', 'b2b@officemax-dist.com', '+1-555-0205', '700 Retail Park', 'Columbus', 'OH', '43215', 'USA', 'Net 20', 'USD', true, ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Vendors: 5 vendors');
  // ─── BC-AP: Bills ─────────────────────────────────────────────────────────
  await sql`
    INSERT INTO bills (id, tenant_id, vendor_id, bill_number, bill_date, due_date, subtotal, tax_amount, total_amount, currency, status, notes, created_by, created_at, updated_at)
    VALUES
      (${BILL_1}, ${T}, ${VEND_1}, 'BILL-TSG-001', '2026-01-10', '2026-02-09', 28800.0000, 2304.0000, 31104.0000, 'USD', 'paid', 'Laptop procurement batch 1', ${ADMIN}, NOW(), NOW()),
      (${BILL_2}, ${T}, ${VEND_3}, 'BILL-SCM-001', '2026-01-15', '2026-03-01', 4500.0000, 360.0000, 4860.0000, 'USD', 'paid', 'Steel sheets 2mm order', ${ADMIN}, NOW(), NOW()),
      (${BILL_3}, ${T}, ${VEND_2}, 'BILL-PWI-001', '2026-02-01', '2026-02-16', 1800.0000, 144.0000, 1944.0000, 'USD', 'partially_paid', 'Paper stock replenishment', ${ADMIN}, NOW(), NOW()),
      (${BILL_4}, ${T}, ${VEND_4}, 'BILL-FPS-001', '2026-02-10', '2026-03-12', 9500.0000, 760.0000, 10260.0000, 'USD', 'approved', 'Office chair and desk order', ${ADMIN}, NOW(), NOW()),
      (${BILL_5}, ${T}, ${VEND_5}, 'BILL-OMD-001', '2026-03-01', '2026-03-21', 1800.0000, 144.0000, 1944.0000, 'USD', 'pending_approval', 'USB-C hub restock', ${ADMIN}, NOW(), NOW()),
      (${BILL_6}, ${T}, ${VEND_1}, 'BILL-TSG-002', '2026-03-15', '2026-04-14', 6400.0000, 512.0000, 6912.0000, 'USD', 'draft', 'Monitor procurement', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Bills: 6 bills');
  // ─── BC-AP: Bill Line Items ───────────────────────────────────────────────
  await sql`
    INSERT INTO bill_line_items (id, bill_id, description, quantity, unit_price, amount, tax_rate, tax_amount, sort_order, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${BILL_1}, 'Laptop Dell XPS 15 (wholesale)', 12, 2400.0000, 28800.0000, 0.0800, 2304.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_2}, 'Steel Sheets 2mm 1m x 2m', 100, 45.0000, 4500.0000, 0.0800, 360.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_3}, 'A4 Copy Paper 500 sheets (case)', 40, 45.0000, 1800.0000, 0.0800, 144.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_4}, 'Ergonomic Office Chair', 5, 700.0000, 3500.0000, 0.0800, 280.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_4}, 'Standing Desk Electric', 6, 1000.0000, 6000.0000, 0.0800, 480.0000, 2, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_5}, 'USB-C Hub 7-in-1', 30, 60.0000, 1800.0000, 0.0800, 144.0000, 1, NOW(), NOW()),
      (gen_random_uuid(), ${BILL_6}, '4K Monitor 27"', 2, 3200.0000, 6400.0000, 0.0800, 512.0000, 1, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Bill Line Items: 7 line items');
  // ─── BC-AP: Vendor Payments ───────────────────────────────────────────────
  await sql`
    INSERT INTO vendor_payments (id, tenant_id, vendor_id, bill_id, amount, payment_date, payment_method, reference_number, bank_account_id, currency, notes, created_at, updated_at)
    VALUES
      (${VPAY_1}, ${T}, ${VEND_1}, ${BILL_1}, 31104.0000, '2026-02-05', 'bank_transfer', 'OUT-TXN-10001', ${BANK_1}, 'USD', 'Paid BILL-TSG-001', NOW(), NOW()),
      (${VPAY_2}, ${T}, ${VEND_3}, ${BILL_2}, 4860.0000, '2026-02-20', 'bank_transfer', 'OUT-TXN-10002', ${BANK_1}, 'USD', 'Paid BILL-SCM-001', NOW(), NOW()),
      (${VPAY_3}, ${T}, ${VEND_2}, ${BILL_3}, 1000.0000, '2026-02-10', 'check', 'CHK-1001', ${BANK_1}, 'USD', 'Partial payment for BILL-PWI-001', NOW(), NOW()),
      (${VPAY_4}, ${T}, ${VEND_4}, ${BILL_4}, 5000.0000, '2026-03-05', 'bank_transfer', 'OUT-TXN-10003', ${BANK_2}, 'USD', 'Partial payment for BILL-FPS-001', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Vendor Payments: 4 payments');
  // ─── BC-PROC: Purchase Orders ─────────────────────────────────────────────
  await sql`
    INSERT INTO purchase_orders (id, tenant_id, po_number, vendor_id, status, order_date, expected_delivery_date, shipping_address_line1, shipping_city, shipping_state, shipping_postal_code, shipping_country, currency, subtotal, tax_amount, total, payment_terms, notes, created_by, created_at, updated_at)
    VALUES
      (${PO_1}, ${T}, 'PO-2026-0001', ${VEND_1}, 'fully_received', '2026-01-05', '2026-01-15', '100 Industrial Blvd', 'Houston', 'TX', '77001', 'USA', 'USD', 28800.0000, 2304.0000, 31104.0000, 'Net 30', 'Laptop batch for Q1', ${ADMIN}, NOW(), NOW()),
      (${PO_2}, ${T}, 'PO-2026-0002', ${VEND_3}, 'fully_received', '2026-01-10', '2026-01-20', '100 Industrial Blvd', 'Houston', 'TX', '77001', 'USA', 'USD', 4500.0000, 360.0000, 4860.0000, 'Net 45', 'Steel sheets for production', ${ADMIN}, NOW(), NOW()),
      (${PO_3}, ${T}, 'PO-2026-0003', ${VEND_4}, 'approved', '2026-03-10', '2026-03-24', '250 Commerce Dr', 'Newark', 'NJ', '07102', 'USA', 'USD', 9500.0000, 760.0000, 10260.0000, 'Net 30', 'Furniture for new office wing', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Purchase Orders: 3 POs');
  // ─── BC-PROC: PO Line Items ───────────────────────────────────────────────
  await sql`
    INSERT INTO po_line_items (id, po_id, line_number, item_id, description, quantity, unit_of_measure, unit_price, amount, tax_rate, tax_amount, received_quantity, notes, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${PO_1}, 1, ${ITEM_1}, 'Laptop Dell XPS 15', 12, 'EA', 2400.0000, 28800.0000, 0.0800, 2304.0000, 12, 'Bulk order', NOW(), NOW()),
      (gen_random_uuid(), ${PO_2}, 1, ${ITEM_8}, 'Steel Sheets 2mm', 100, 'PCS', 45.0000, 4500.0000, 0.0800, 360.0000, 100, 'Full delivery', NOW(), NOW()),
      (gen_random_uuid(), ${PO_3}, 1, ${ITEM_6}, 'Ergonomic Office Chair', 5, 'EA', 700.0000, 3500.0000, 0.0800, 280.0000, 0, '', NOW(), NOW()),
      (gen_random_uuid(), ${PO_3}, 2, ${ITEM_7}, 'Standing Desk Electric', 6, 'EA', 1000.0000, 6000.0000, 0.0800, 480.0000, 0, '', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  PO Line Items: 4 line items');
  // ─── BC-PROC: Receiving Reports ───────────────────────────────────────────
  await sql`
    INSERT INTO receiving_reports (id, tenant_id, rr_number, po_id, vendor_id, received_date, received_by, warehouse_id, status, notes, created_at, updated_at)
    VALUES
      (${RR_1}, ${T}, 'RR-2026-0001', ${PO_1}, ${VEND_1}, '2026-01-15', ${EMP_1}, ${WH_1}, 'confirmed', 'All 12 laptops received in good condition', NOW(), NOW()),
      (${RR_2}, ${T}, 'RR-2026-0002', ${PO_2}, ${VEND_3}, '2026-01-20', ${EMP_1}, ${WH_1}, 'confirmed', '100 steel sheets received, verified count', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Receiving Reports: 2 reports');
  // ─── BC-SALES: Sales Orders ───────────────────────────────────────────────
  await sql`
    INSERT INTO sales_orders (id, tenant_id, order_number, customer_id, status, order_date, expected_delivery_date, subtotal, discount_amount, tax_amount, total, currency, notes, created_at, updated_at)
    VALUES
      (${SO_1}, ${T}, 'SO-2026-0001', ${CUST_1}, 'shipped', '2026-01-12', '2026-01-25', 5000.0000, 0, 400.0000, 5400.0000, 'USD', 'Express shipping requested', NOW(), NOW()),
      (${SO_2}, ${T}, 'SO-2026-0002', ${CUST_2}, 'delivered', '2026-01-18', '2026-02-01', 12500.0000, 0, 1000.0000, 13500.0000, 'USD', 'Bulk mouse order', NOW(), NOW()),
      (${SO_3}, ${T}, 'SO-2026-0003', ${CUST_3}, 'confirmed', '2026-02-28', '2026-03-15', 3200.0000, 0, 256.0000, 3456.0000, 'USD', 'Standard delivery', NOW(), NOW()),
      (${SO_4}, ${T}, 'SO-2026-0004', ${CUST_5}, 'processing', '2026-03-05', '2026-03-20', 6750.0000, 0, 540.0000, 7290.0000, 'USD', 'Priority handling', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Sales Orders: 4 orders');
  // ─── BC-SALES: Sales Order Line Items ─────────────────────────────────────
  await sql`
    INSERT INTO sales_order_line_items (id, tenant_id, sales_order_id, item_id, description, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, total, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${T}, ${SO_1}, ${ITEM_1}, 'Laptop Dell XPS 15', 2, 2400.0000, 0, 0, 0.0800, 384.0000, 4784.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_1}, ${ITEM_2}, 'Wireless Mouse Logitech', 2, 100.0000, 0, 0, 0.0800, 16.0000, 216.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_2}, ${ITEM_2}, 'Wireless Mouse Logitech', 125, 100.0000, 0, 0, 0.0800, 1000.0000, 13500.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_3}, ${ITEM_4}, 'A4 Copy Paper 500 sheets', 40, 45.0000, 0, 0, 0.0800, 144.0000, 1944.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_3}, ${ITEM_5}, 'Ballpoint Pens Blue (Box)', 20, 70.0000, 0, 0, 0.0800, 112.0000, 1512.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_4}, ${ITEM_10}, '4K Monitor 27"', 2, 3200.0000, 0, 0, 0.0800, 512.0000, 6912.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${SO_4}, ${ITEM_6}, 'Ergonomic Office Chair', 2, 1000.0000, 10, 250.0000, 0.0800, 40.0000, 1790.0000, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Sales Order Line Items: 7 line items');
  // ─── BC-SALES: Quotations ─────────────────────────────────────────────────
  await sql`
    INSERT INTO quotations (id, tenant_id, quotation_number, customer_id, status, issue_date, expiry_date, subtotal, discount_amount, tax_amount, total, currency, valid_days, notes, created_at, updated_at)
    VALUES
      (${QT_1}, ${T}, 'QT-2026-0001', ${CUST_4}, 'sent', '2026-03-01', '2026-03-31', 22000.0000, 0, 1760.0000, 23760.0000, 'USD', 30, 'Bulk laptop quote for Wayne Enterprises', NOW(), NOW()),
      (${QT_2}, ${T}, 'QT-2026-0002', ${CUST_5}, 'accepted', '2026-03-05', '2026-04-04', 6750.0000, 0, 540.0000, 7290.0000, 'USD', 30, 'Office furniture setup quote', NOW(), NOW()),
      (${QT_3}, ${T}, 'QT-2026-0003', ${CUST_3}, 'draft', '2026-03-15', '2026-04-14', 1800.0000, 0, 144.0000, 1944.0000, 'USD', 30, 'USB-C hub bulk quote', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Quotations: 3 quotations');
  // ─── BC-SALES: Quotation Line Items ───────────────────────────────────────
  await sql`
    INSERT INTO quotation_line_items (id, tenant_id, quotation_id, item_id, description, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, total, created_at, updated_at)
    VALUES
      (gen_random_uuid(), ${T}, ${QT_1}, ${ITEM_1}, 'Laptop Dell XPS 15', 10, 2200.0000, 0, 0, 0.0800, 1760.0000, 23760.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${QT_2}, ${ITEM_6}, 'Ergonomic Office Chair', 5, 950.0000, 0, 0, 0.0800, 380.0000, 5130.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${QT_2}, ${ITEM_7}, 'Standing Desk Electric', 2, 1000.0000, 0, 0, 0.0800, 160.0000, 2160.0000, NOW(), NOW()),
      (gen_random_uuid(), ${T}, ${QT_3}, ${ITEM_3}, 'USB-C Hub 7-in-1', 30, 60.0000, 0, 0, 0.0800, 144.0000, 1944.0000, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Quotation Line Items: 4 line items');
  // ─── BC-CASH: Bank Transfers ──────────────────────────────────────────────
  await sql`
    INSERT INTO bank_transfers (id, tenant_id, source_account_id, destination_account_id, amount, currency_code, transfer_type, status, reference_number, description, scheduled_date, completed_at, created_by, created_at, updated_at)
    VALUES
      (${BT_1}, ${T}, ${BANK_1}, ${BANK_2}, 10000.0000, 'USD', 'internal', 'completed', 'TRF-2026-0001', 'Monthly savings transfer', '2026-01-31', '2026-01-31', ${ADMIN}, NOW(), NOW()),
      (${BT_2}, ${T}, ${BANK_1}, ${BANK_3}, 1500.0000, 'USD', 'internal', 'completed', 'TRF-2026-0002', 'Petty cash replenishment', '2026-02-15', '2026-02-15', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Bank Transfers: 2 transfers');
  // ─── BC-ASSET: Asset Categories ───────────────────────────────────────────
  await sql`
    INSERT INTO asset_categories (id, tenant_id, name, code, description, default_depreciation_method, default_useful_life_months, default_salvage_value_percent, is_depreciable, gl_account_id, is_active, created_at, updated_at)
    VALUES
      (${ACAT_1}, ${T}, 'IT Equipment', 'IT-EQ', 'Computers, monitors, and peripherals', 'straight_line', 36, 10, true, ${ACC_FIXED}, true, NOW(), NOW()),
      (${ACAT_2}, ${T}, 'Office Furniture', 'FURN', 'Desks, chairs, and fixtures', 'straight_line', 60, 5, true, ${ACC_FIXED}, true, NOW(), NOW()),
      (${ACAT_3}, ${T}, 'Vehicles', 'VEH', 'Company vehicles', 'declining_balance', 84, 15, true, ${ACC_FIXED}, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Asset Categories: 3 categories');
  // ─── BC-ASSET: Fixed Assets ───────────────────────────────────────────────
  await sql`
    INSERT INTO fixed_assets (id, tenant_id, name, asset_number, description, category_id, acquisition_date, acquisition_cost, salvage_value, useful_life_months, depreciation_method, status, accumulated_depreciation, net_book_value, gl_account_id, is_depreciable, created_by, created_at, updated_at)
    VALUES
      (${ASSET_1}, ${T}, 'Server Rack Dell PowerEdge', 'FA-IT-001', 'Dell PowerEdge R740 rack server', ${ACAT_1}, '2025-01-15', 15000.0000, 1500.0000, 36, 'straight_line', 'active', 0, 15000.0000, ${ACC_FIXED}, true, ${ADMIN}, NOW(), NOW()),
      (${ASSET_2}, ${T}, 'Executive Desk', 'FA-FN-001', 'Solid oak executive desk', ${ACAT_2}, '2025-03-01', 3500.0000, 175.0000, 60, 'straight_line', 'active', 0, 3500.0000, ${ACC_FIXED}, true, ${ADMIN}, NOW(), NOW()),
      (${ASSET_3}, ${T}, 'Conference Table', 'FA-FN-002', '12-person conference table', ${ACAT_2}, '2025-06-15', 5000.0000, 250.0000, 60, 'straight_line', 'active', 0, 5000.0000, ${ACC_FIXED}, true, ${ADMIN}, NOW(), NOW()),
      (${ASSET_4}, ${T}, 'Laptop Fleet (10x)', 'FA-IT-002', '10x Dell XPS 15 laptops', ${ACAT_1}, '2025-09-01', 24000.0000, 2400.0000, 36, 'straight_line', 'active', 0, 24000.0000, ${ACC_FIXED}, true, ${ADMIN}, NOW(), NOW()),
      (${ASSET_5}, ${T}, 'Company Van', 'FA-VH-001', 'Ford Transit 250 cargo van', ${ACAT_3}, '2025-04-01', 38000.0000, 5700.0000, 84, 'declining_balance', 'active', 0, 38000.0000, ${ACC_FIXED}, true, ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Fixed Assets: 5 assets');
  // ─── BC-ASSET: Depreciation Schedules ─────────────────────────────────────
  await sql`
    INSERT INTO depreciation_schedules (id, tenant_id, asset_id, start_date, end_date, total_depreciable_cost, monthly_amount, method, status, created_at, updated_at)
    VALUES
      (${DSCH_1}, ${T}, ${ASSET_1}, '2025-01-15', '2028-01-15', 13500.0000, 375.0000, 'straight_line', 'active', NOW(), NOW()),
      (${DSCH_2}, ${T}, ${ASSET_2}, '2025-03-01', '2030-03-01', 3325.0000, 55.4167, 'straight_line', 'active', NOW(), NOW()),
      (${DSCH_3}, ${T}, ${ASSET_3}, '2025-06-15', '2030-06-15', 4750.0000, 79.1667, 'straight_line', 'active', NOW(), NOW()),
      (${DSCH_4}, ${T}, ${ASSET_4}, '2025-09-01', '2028-09-01', 21600.0000, 600.0000, 'straight_line', 'active', NOW(), NOW()),
      (${DSCH_5}, ${T}, ${ASSET_5}, '2025-04-01', '2032-04-01', 32300.0000, 384.5238, 'declining_balance', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Depreciation Schedules: 5 schedules');
  // ─── BC-TAX: Tax Codes ────────────────────────────────────────────────────
  await sql`
    INSERT INTO tax_codes (id, tenant_id, code, name, type, gl_account_id, is_claimable, posting_rule, is_active, description, created_at, updated_at)
    VALUES
      (${TCODE_GST}, ${T}, 'GST', 'Goods and Services Tax', 'gst', ${ACC_SALESTAX}, true, 'output_liability', true, 'Standard GST applied to goods and services', NOW(), NOW()),
      (${TCODE_VAT}, ${T}, 'VAT', 'Value Added Tax', 'vat', ${ACC_SALESTAX}, true, 'output_liability', true, 'VAT for international transactions', NOW(), NOW()),
      (${TCODE_WHT}, ${T}, 'WHT', 'Withholding Tax', 'withholding', ${ACCINCTAX}, false, 'expense', true, 'Tax withheld on vendor payments', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Tax Codes: GST, VAT, WHT');
  // ─── BC-TAX: Tax Rates ────────────────────────────────────────────────────
  await sql`
    INSERT INTO tax_rates (id, tenant_id, tax_code_id, rate, effective_date, expiry_date, description, is_active, created_at, updated_at)
    VALUES
      (${TRATE_1}, ${T}, ${TCODE_GST}, 0.0800, '2026-01-01', '2026-12-31', 'Standard GST rate 8%', true, NOW(), NOW()),
      (${TRATE_2}, ${T}, ${TCODE_GST}, 0.1000, '2027-01-01', NULL, 'Increased GST rate 10% (next year)', true, NOW(), NOW()),
      (${TRATE_3}, ${T}, ${TCODE_VAT}, 0.0500, '2026-01-01', '2026-12-31', 'VAT rate 5% for exports', true, NOW(), NOW()),
      (${TRATE_4}, ${T}, ${TCODE_WHT}, 0.1000, '2026-01-01', NULL, 'Standard WHT rate 10%', true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Tax Rates: 4 rates');
  // ─── BC-BUDGET: Budget Headers ────────────────────────────────────────────
  await sql`
    INSERT INTO budget_headers (id, tenant_id, name, description, period_start, period_end, total_amount, status, is_active, created_at, updated_at)
    VALUES
      (${BHDR_1}, ${T}, 'Operations Budget H1 2026', 'Operating expenses budget for first half of 2026', '2026-01-01', '2026-06-30', 250000.0000, 'active', true, NOW(), NOW()),
      (${BHDR_2}, ${T}, 'IT Capital Budget 2026', 'Capital expenditure budget for IT department', '2026-01-01', '2026-12-31', 100000.0000, 'draft', true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Budget Headers: 2 budgets');
  // ─── BC-BUDGET: Budget Lines ──────────────────────────────────────────────
  await sql`
    INSERT INTO budget_lines (id, tenant_id, budget_header_id, gl_account_id, description, budget_amount, consumed_amount, variance_amount, is_active, created_at, updated_at)
    VALUES
      (${BLINE_1}, ${T}, ${BHDR_1}, ${ACC_SALARY}, 'Salaries and wages', 120000.0000, 60000.0000, -60000.0000, true, NOW(), NOW()),
      (${BLINE_2}, ${T}, ${BHDR_1}, ${ACC_RENT}, 'Office rent', 48000.0000, 24000.0000, -24000.0000, true, NOW(), NOW()),
      (${BLINE_3}, ${T}, ${BHDR_1}, ${ACC_UTIL}, 'Utilities', 12000.0000, 6500.0000, -5500.0000, true, NOW(), NOW()),
      (${BLINE_4}, ${T}, ${BHDR_1}, ${ACC_MKT}, 'Marketing', 30000.0000, 18000.0000, -12000.0000, true, NOW(), NOW()),
      (${BLINE_5}, ${T}, ${BHDR_2}, ${ACC_FIXED}, 'Hardware purchases', 60000.0000, 24000.0000, -36000.0000, true, NOW(), NOW()),
      (${BLINE_6}, ${T}, ${BHDR_2}, ${ACC_INS}, 'Software licenses', 40000.0000, 15000.0000, -25000.0000, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Budget Lines: 6 lines');
  // ─── BC-REPORT: Report Templates ──────────────────────────────────────────
  await sql`
    INSERT INTO report_templates (id, name, description, category, layout_config, parameter_schema, output_formats, version, is_system, created_at, updated_at)
    VALUES
      (${RTPL_1}, 'Profit & Loss Statement', 'Standard P&L report with revenue and expense breakdown', 'financial', '{"type":"table","columns":["Account","Amount","Percentage"]}'::jsonb, '{"period":{"type":"date_range","required":true}}'::jsonb, '["pdf","xlsx","csv"]'::jsonb, 1, true, NOW(), NOW()),
      (${RTPL_2}, 'Inventory Valuation Report', 'Current stock levels with cost valuation', 'inventory', '{"type":"table","columns":["Item","Qty","Unit Cost","Total Value"]}'::jsonb, '{"warehouse_id":{"type":"uuid","required":false}}'::jsonb, '["pdf","xlsx"]'::jsonb, 1, true, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Report Templates: 2 templates');
  // ─── BC-REPORT: Reports ───────────────────────────────────────────────────
  await sql`
    INSERT INTO reports (id, tenant_id, name, description, template_id, status, created_by, created_at, updated_at)
    VALUES
      (${RPT_1}, ${T}, 'P&L Q1 2026', 'Profit and loss for January to March 2026', ${RTPL_1}, 'completed', ${ADMIN}, NOW(), NOW()),
      (${RPT_2}, ${T}, 'Inventory Snapshot March 2026', 'End of month inventory valuation', ${RTPL_2}, 'completed', ${ADMIN}, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
  console.log('  Reports: 2 reports');
  console.log('\nSeed completed successfully! All 13 bounded contexts seeded.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
