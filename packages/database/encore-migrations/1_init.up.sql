-- ============================================================
-- Lumora ERP - Initial Schema
-- Combined from Drizzle migrations
-- ============================================================

-- ========================
-- ENUM TYPES
-- ========================

CREATE TYPE "bill_status" AS ENUM('draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided');

CREATE TYPE "credit_note_status" AS ENUM('draft', 'issued', 'applied', 'voided');

CREATE TYPE "invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'voided');

CREATE TYPE "payment_method" AS ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'online');

CREATE TYPE "bank_account_status" AS ENUM('active', 'inactive', 'frozen', 'closed');

CREATE TYPE "bank_account_type" AS ENUM('checking', 'savings', 'money_market', 'credit_line');

CREATE TYPE "connection_status" AS ENUM('active', 'expired', 'error', 'disabled');

CREATE TYPE "connection_type" AS ENUM('plaid', 'yodlee', 'ofx', 'manual');

CREATE TYPE "import_source" AS ENUM('api', 'csv', 'ofx', 'manual');

CREATE TYPE "import_status" AS ENUM('pending', 'processing', 'completed', 'failed');

CREATE TYPE "reconciliation_status" AS ENUM('unmatched', 'auto_matched', 'manually_matched', 'excluded', 'disputed');

CREATE TYPE "sync_frequency" AS ENUM('realtime', 'hourly', 'daily', 'manual');

CREATE TYPE "transaction_type" AS ENUM('credit', 'debit', 'transfer', 'fee', 'interest');

CREATE TYPE "transfer_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');

CREATE TYPE "transfer_type" AS ENUM('internal', 'external', 'wire', 'ach', 'check');

CREATE TYPE "account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense');

CREATE TYPE "journal_entry_status" AS ENUM('draft', 'posted', 'voided');

CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'half_day', 'work_from_home');

CREATE TYPE "department_status" AS ENUM('active', 'inactive');

CREATE TYPE "employee_status" AS ENUM('active', 'on_leave', 'terminated');

CREATE TYPE "employment_type" AS ENUM('full_time', 'part_time', 'contract', 'intern');

CREATE TYPE "leave_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');

CREATE TYPE "pay_frequency" AS ENUM('monthly', 'bi_weekly', 'weekly');

CREATE TYPE "payroll_status" AS ENUM('draft', 'processed', 'paid');

CREATE TYPE "cost_method" AS ENUM('fifo', 'lifo', 'weighted_average', 'specific_identification');

CREATE TYPE "movement_type" AS ENUM('inbound', 'outbound', 'transfer', 'adjustment');

CREATE TYPE "uom_category" AS ENUM('count', 'weight', 'volume', 'length', 'area');

CREATE TYPE "po_status" AS ENUM('draft', 'pending_approval', 'approved', 'partially_received', 'fully_received', 'closed', 'cancelled');

CREATE TYPE "receiving_report_status" AS ENUM('draft', 'confirmed', 'rejected');

CREATE TYPE "quotation_status" AS ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled');

CREATE TYPE "sales_order_status" AS ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'closed');

CREATE TYPE "adjustment_direction" AS ENUM('increase', 'decrease');

CREATE TYPE "asset_adjustment_type" AS ENUM('revaluation', 'impairment', 'restoration', 'transfer', 'reclassification');

CREATE TYPE "asset_status" AS ENUM('active', 'fully_depreciated', 'disposed', 'under_construction');

CREATE TYPE "depreciation_entry_status" AS ENUM('draft', 'posted', 'voided');

CREATE TYPE "depreciation_method" AS ENUM('straight_line', 'declining_balance', 'units_of_activity', 'sum_of_years_digits');

CREATE TYPE "tax_posting_rule" AS ENUM('output_liability', 'input_asset', 'expense');

CREATE TYPE "tax_type" AS ENUM('sales_tax', 'vat', 'gst', 'excise', 'withholding');

-- ========================
-- TABLES
-- ========================

CREATE TABLE "ai_models" (
	"id" uuid PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"model_type" varchar(20) NOT NULL,
	"version" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'training' NOT NULL,
	"accuracy_score" numeric(5,4),
	"training_data_id" uuid,
	"config" jsonb NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deployed_at" timestamp
);

CREATE TABLE "anomaly_detections" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"model_id" uuid NOT NULL,
	"data_source" varchar(200) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"anomaly_score" numeric(5,4) NOT NULL,
	"severity" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'detected' NOT NULL,
	"detected_at" timestamp NOT NULL,
	"tenant_id" uuid NOT NULL
);

CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY,
	"model_id" uuid NOT NULL,
	"prediction_type" varchar(20) NOT NULL,
	"input_data" jsonb NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"predicted_value" jsonb NOT NULL,
	"confidence_score" numeric(5,4) NOT NULL,
	"explanation" jsonb,
	"recommendation" varchar(500),
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "training_data" (
	"id" uuid PRIMARY KEY,
	"source_type" varchar(20) NOT NULL,
	"source_config" jsonb NOT NULL,
	"feature_columns" jsonb NOT NULL,
	"target_column" text NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"date_range_start" date,
	"date_range_end" date,
	"quality_score" numeric(5,4),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "workflow_steps" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"step_order" integer NOT NULL,
	"step_type" varchar(20) NOT NULL,
	"input_schema" jsonb NOT NULL,
	"output_schema" jsonb NOT NULL,
	"timeout_seconds" integer,
	"retry_count" integer
);

CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" varchar(1000),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"trigger_type" varchar(50) NOT NULL,
	"trigger_config" jsonb,
	"created_by" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"username" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL
);

CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" varchar NOT NULL,
	"provider" varchar DEFAULT 'email' NOT NULL
);

CREATE TABLE "mfa_config" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL UNIQUE,
	"secret" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"backup_codes" text
);

CREATE TABLE "oauth_providers" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"access_token" varchar,
	"refresh_token" varchar
);

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"tenant_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false NOT NULL
);

CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"resource" varchar NOT NULL,
	"action" varchar NOT NULL
);

CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"user_id" uuid NOT NULL,
	"token" varchar NOT NULL UNIQUE,
	"ip_address" varchar,
	"user_agent" varchar,
	"expires_at" timestamp NOT NULL
);

CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);

CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(200) NOT NULL,
	"code" varchar(20) NOT NULL,
	"tax_id" varchar(50),
	"email" varchar(255),
	"phone" varchar(30),
	"address_line1" varchar(200),
	"address_line2" varchar(200),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(3),
	"payment_terms" varchar(50),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"vendor_id" uuid NOT NULL,
	"bill_number" varchar(50) NOT NULL,
	"bill_date" date NOT NULL,
	"due_date" date NOT NULL,
	"purchase_order_id" uuid,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"total_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "bill_status" DEFAULT 'draft'::"bill_status" NOT NULL,
	"notes" text
);

CREATE TABLE "bill_line_items" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"bill_id" uuid NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(10,4) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5,4),
	"tax_amount" numeric(19,4),
	"sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "payment_schedules" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bill_id" uuid NOT NULL,
	"due_date" timestamp NOT NULL,
	"amount" numeric(19,4) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL
);

CREATE TABLE "vendor_payments" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"vendor_id" uuid NOT NULL,
	"bill_id" uuid,
	"amount" numeric(19,4) NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_method" varchar NOT NULL,
	"reference_number" varchar,
	"bank_account_id" uuid,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text
);

CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(200) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"address_line1" varchar(200),
	"address_line2" varchar(200),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(3),
	"payment_terms" varchar(50) DEFAULT 'Net 30' NOT NULL,
	"credit_limit" numeric(19,4),
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "credit_notes" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"customer_id" uuid NOT NULL,
	"credit_note_number" varchar(50) NOT NULL UNIQUE,
	"status" "credit_note_status" DEFAULT 'draft'::"credit_note_status" NOT NULL,
	"issue_date" date NOT NULL,
	"reason" varchar(500) NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"amount_applied" numeric(19,4) DEFAULT '0' NOT NULL,
	"balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text
);

CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"customer_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL UNIQUE,
	"status" "invoice_status" DEFAULT 'draft'::"invoice_status" NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"total_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(19,4) DEFAULT '0' NOT NULL,
	"balance_due" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text
);

CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(10,4) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5,4),
	"tax_amount" numeric(19,4),
	"sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"customer_id" uuid NOT NULL,
	"payment_number" varchar(50) NOT NULL UNIQUE,
	"payment_date" date NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"reference_number" varchar(100),
	"bank_account_id" uuid,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text
);

CREATE TABLE "payment_applications" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount_applied" numeric(19,4) DEFAULT '0' NOT NULL,
	"applied_date" date NOT NULL
);

CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"bank_name" varchar(100) NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"routing_number" varchar(20),
	"account_type" "bank_account_type" NOT NULL,
	"currency_code" varchar(3) DEFAULT 'USD' NOT NULL,
	"current_balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"available_balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"status" "bank_account_status" DEFAULT 'active'::"bank_account_status" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"last_synced_at" timestamp
);

CREATE TABLE "bank_connections" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"bank_account_id" uuid NOT NULL,
	"connection_type" "connection_type" NOT NULL,
	"institution_name" varchar(100) NOT NULL,
	"institution_id" varchar(50),
	"access_token" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"status" "connection_status" DEFAULT 'active'::"connection_status" NOT NULL,
	"last_sync_at" timestamp,
	"last_sync_error" varchar(255),
	"sync_frequency" "sync_frequency" DEFAULT 'daily'::"sync_frequency" NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "bank_statements" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bank_account_id" uuid NOT NULL,
	"statement_date" date NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"opening_balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"closing_balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"import_source" "import_source" NOT NULL,
	"import_status" "import_status" DEFAULT 'pending'::"import_status" NOT NULL,
	"file_reference" varchar(255),
	"transaction_count" integer DEFAULT 0 NOT NULL,
	"reconciled_count" integer DEFAULT 0 NOT NULL,
	"imported_by" uuid NOT NULL,
	"imported_at" timestamp NOT NULL
);

CREATE TABLE "bank_transfers" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"source_account_id" uuid NOT NULL,
	"destination_account_id" uuid NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency_code" varchar(3) DEFAULT 'USD' NOT NULL,
	"transfer_type" "transfer_type" NOT NULL,
	"status" "transfer_status" DEFAULT 'pending'::"transfer_status" NOT NULL,
	"reference_number" varchar(50),
	"description" varchar(255),
	"scheduled_date" date,
	"completed_at" timestamp,
	"failure_reason" varchar(255),
	"created_by" uuid NOT NULL
);

CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"code" varchar(3) NOT NULL UNIQUE,
	"name" varchar(50) NOT NULL,
	"symbol" varchar(5) NOT NULL,
	"decimal_places" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "reconciliation_entries" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"statement_id" uuid NOT NULL,
	"bank_account_id" uuid NOT NULL,
	"transaction_date" date NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"balance_after" numeric(19,4),
	"transaction_type" "transaction_type" NOT NULL,
	"reference_number" varchar(50),
	"reconciliation_status" "reconciliation_status" DEFAULT 'unmatched'::"reconciliation_status" NOT NULL,
	"matched_entity_id" uuid,
	"matched_entity_type" varchar(50),
	"match_confidence" numeric(5,4),
	"reconciled_by" uuid,
	"reconciled_at" timestamp
);

CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"code" varchar(20) NOT NULL UNIQUE,
	"name" varchar(100) NOT NULL,
	"type" "account_type" NOT NULL,
	"parent_id" uuid,
	"balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "fiscal_years" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'open' NOT NULL
);

CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"reference_number" varchar(50),
	"status" "journal_entry_status" DEFAULT 'draft'::"journal_entry_status" NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "journal_entry_lines" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"journal_entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit" numeric(19,4) DEFAULT '0' NOT NULL,
	"credit" numeric(19,4) DEFAULT '0' NOT NULL,
	"description" text
);

CREATE TABLE "audit_log_entries" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100) NOT NULL,
	"resource_id" uuid,
	"old_values" json,
	"new_values" json,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"metadata" json
);

CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" date NOT NULL,
	"clock_in" timestamp,
	"clock_out" timestamp,
	"status" "attendance_status" NOT NULL,
	"hours_worked" numeric(5,2),
	"overtime_hours" numeric(5,2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL UNIQUE,
	"description" varchar(500),
	"head_id" uuid,
	"parent_id" uuid,
	"status" "department_status" DEFAULT 'active'::"department_status" NOT NULL
);

CREATE TABLE "designations" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL UNIQUE,
	"description" varchar(500),
	"level" integer DEFAULT 1 NOT NULL,
	"salary_band_min" numeric(19,4),
	"salary_band_max" numeric(19,4),
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"user_id" uuid UNIQUE,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone" varchar(20),
	"hire_date" date NOT NULL,
	"department_id" uuid NOT NULL,
	"designation_id" uuid NOT NULL,
	"manager_id" uuid,
	"employment_type" "employment_type" NOT NULL,
	"status" "employee_status" DEFAULT 'active'::"employee_status" NOT NULL
);

CREATE TABLE "leave_types" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(50) NOT NULL,
	"code" varchar(20) NOT NULL UNIQUE,
	"days_per_year" integer DEFAULT 0 NOT NULL,
	"is_paid" boolean DEFAULT true NOT NULL,
	"carry_forward" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text,
	"status" "leave_status" DEFAULT 'pending'::"leave_status" NOT NULL,
	"rejection_reason" text,
	"approved_by" uuid,
	"approved_at" timestamp
);

CREATE TABLE "payroll" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"employee_id" uuid NOT NULL,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"basic_salary" numeric(19,4) DEFAULT '0' NOT NULL,
	"allowances" numeric(19,4) DEFAULT '0' NOT NULL,
	"deductions" numeric(19,4) DEFAULT '0' NOT NULL,
	"net_pay" numeric(19,4) DEFAULT '0' NOT NULL,
	"status" "payroll_status" DEFAULT 'draft'::"payroll_status" NOT NULL,
	"processed_at" timestamp,
	"paid_at" timestamp
);

CREATE TABLE "payslips" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"payroll_id" uuid,
	"period" varchar NOT NULL,
	"gross_pay" numeric(19,4) NOT NULL,
	"deductions" numeric(19,4) DEFAULT '0' NOT NULL,
	"net_pay" numeric(19,4) NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"employee_id" uuid NOT NULL UNIQUE,
	"basic_salary" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"pay_frequency" "pay_frequency" DEFAULT 'monthly'::"pay_frequency" NOT NULL,
	"effective_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "unit_of_measures" (
	"id" uuid PRIMARY KEY,
	"code" varchar(10) NOT NULL UNIQUE,
	"name" varchar(50) NOT NULL,
	"category" "uom_category" NOT NULL,
	"decimal_places" integer DEFAULT 0 NOT NULL,
	"base_uom_id" uuid,
	"conversion_factor" numeric(19,6) DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "item_categories" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" varchar(500),
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "items" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"sku" varchar(50) NOT NULL UNIQUE,
	"barcode" varchar(100),
	"name" varchar(200) NOT NULL,
	"description" varchar(1000),
	"category_id" uuid NOT NULL,
	"unit_of_measure_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_serialized" boolean DEFAULT false NOT NULL,
	"is_lot_tracked" boolean DEFAULT false NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"reorder_optimal_quantity" integer DEFAULT 0 NOT NULL,
	"reorder_lead_time_days" integer DEFAULT 0 NOT NULL,
	"reorder_safety_stock" integer DEFAULT 0 NOT NULL,
	"cost_method" "cost_method" DEFAULT 'weighted_average'::"cost_method" NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"address_line1" varchar(200),
	"address_line2" varchar(200),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(3),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);

CREATE TABLE "stock_levels" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"quantity_available" integer DEFAULT 0 NOT NULL,
	"quantity_on_order" integer DEFAULT 0 NOT NULL,
	"last_counted_at" timestamp,
	"last_movement_at" timestamp,
	CONSTRAINT "stock_levels_item_id_warehouse_id_unique" UNIQUE("item_id","warehouse_id")
);

CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"movement_type" "movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"source_document_type" varchar(50) NOT NULL,
	"source_document_id" uuid NOT NULL,
	"unit_cost" numeric(19,4) DEFAULT '0' NOT NULL,
	"total_cost" numeric(19,4) DEFAULT '0' NOT NULL,
	"reference_warehouse_id" uuid,
	"reason" varchar(500),
	"movement_date" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"po_number" varchar(30) NOT NULL UNIQUE,
	"vendor_id" uuid NOT NULL,
	"status" "po_status" DEFAULT 'draft'::"po_status" NOT NULL,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"shipping_address_line1" varchar(200) NOT NULL,
	"shipping_address_line2" varchar(200),
	"shipping_city" varchar(100) NOT NULL,
	"shipping_state" varchar(100) NOT NULL,
	"shipping_postal_code" varchar(20) NOT NULL,
	"shipping_country" varchar(3) DEFAULT 'USD' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"payment_terms" varchar(50) NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp
);

CREATE TABLE "po_line_items" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"po_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(19,4) DEFAULT '1' NOT NULL,
	"unit_of_measure" varchar(20) NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5,4),
	"tax_amount" numeric(19,4),
	"received_quantity" numeric(19,4) DEFAULT '0' NOT NULL,
	"notes" text
);

CREATE TABLE "receiving_reports" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"rr_number" varchar(30) NOT NULL UNIQUE,
	"po_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"received_date" date NOT NULL,
	"received_by" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"status" "receiving_report_status" DEFAULT 'draft'::"receiving_report_status" NOT NULL,
	"notes" text
);

CREATE TABLE "vendor_catalog_items" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"vendor_id" uuid NOT NULL,
	"vendor_item_code" varchar(50) NOT NULL,
	"internal_item_id" uuid,
	"description" varchar(500) NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"unit_of_measure" varchar(20) NOT NULL,
	"lead_time_days" integer,
	"minimum_order_quantity" numeric(19,4),
	"effective_date" date NOT NULL,
	"expiry_date" date
);

CREATE TABLE "report_templates" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(20) NOT NULL,
	"layout_config" jsonb NOT NULL,
	"parameter_schema" jsonb NOT NULL,
	"output_formats" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL
);

CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(200) NOT NULL,
	"description" text,
	"template_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL
);

CREATE TABLE "dashboards" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"title" varchar(200) NOT NULL,
	"description" text,
	"layout" jsonb NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"refresh_interval_seconds" integer
);

CREATE TABLE "data_sources" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(200) NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"context_ref" varchar(100) NOT NULL,
	"query_config" jsonb NOT NULL,
	"refresh_policy" varchar(20) NOT NULL,
	"cache_ttl_seconds" integer,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "kpis" (
	"id" uuid PRIMARY KEY,
	"tenant_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"metric_type" varchar(20) NOT NULL,
	"formula" text,
	"unit" varchar(50),
	"target_value" numeric(19,4) NOT NULL,
	"warning_threshold" numeric(19,4),
	"critical_threshold" numeric(19,4),
	"direction" varchar(30) NOT NULL,
	"current_value" numeric(19,4),
	"last_calculated_at" timestamp,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "report_exports" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"report_id" uuid NOT NULL,
	"format" varchar(10) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size_bytes" bigint,
	"storage_path" varchar(500),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" uuid NOT NULL,
	"requested_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp
);

CREATE TABLE "report_schedules" (
	"id" uuid PRIMARY KEY,
	"report_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cron_expression" varchar(100) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"next_run_at" timestamp,
	"last_run_at" timestamp,
	"delivery_method" varchar(20) NOT NULL,
	"delivery_config" jsonb,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "discount_policies" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"value" numeric(12,2) DEFAULT '0' NOT NULL,
	"min_quantity" numeric(12,2),
	"max_discount_amount" numeric(19,4),
	"valid_from" date NOT NULL,
	"valid_until" date,
	"customer_id" uuid
);

CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"quotation_number" varchar(50) NOT NULL UNIQUE,
	"customer_id" uuid NOT NULL,
	"status" "quotation_status" DEFAULT 'draft'::"quotation_status" NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"valid_days" integer DEFAULT 30 NOT NULL,
	"notes" text
);

CREATE TABLE "quotation_line_items" (
	"id" uuid PRIMARY KEY,
	"tenant_id" uuid NOT NULL,
	"quotation_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"description" varchar(500),
	"quantity" numeric(12,2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"discount_percent" numeric(5,2),
	"discount_amount" numeric(19,4),
	"tax_rate" numeric(5,4),
	"tax_amount" numeric(19,4),
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"order_number" varchar(50) NOT NULL UNIQUE,
	"customer_id" uuid NOT NULL,
	"status" "sales_order_status" DEFAULT 'draft'::"sales_order_status" NOT NULL,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text
);

CREATE TABLE "sales_order_line_items" (
	"id" uuid PRIMARY KEY,
	"tenant_id" uuid NOT NULL,
	"sales_order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"description" varchar(500),
	"quantity" numeric(12,2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"discount_percent" numeric(5,2),
	"discount_amount" numeric(19,4),
	"tax_rate" numeric(5,4),
	"tax_amount" numeric(19,4),
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "asset_categories" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" text,
	"default_depreciation_method" "depreciation_method" DEFAULT 'straight_line'::"depreciation_method" NOT NULL,
	"default_useful_life_months" integer DEFAULT 60 NOT NULL,
	"default_salvage_value_percent" numeric(5,2) DEFAULT '0' NOT NULL,
	"is_depreciable" boolean DEFAULT true NOT NULL,
	"gl_account_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "fixed_assets" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(200) NOT NULL,
	"asset_number" varchar(50) NOT NULL,
	"description" text,
	"category_id" uuid NOT NULL,
	"acquisition_date" date NOT NULL,
	"acquisition_cost" numeric(19,4) DEFAULT '0' NOT NULL,
	"salvage_value" numeric(19,4) DEFAULT '0' NOT NULL,
	"useful_life_months" integer DEFAULT 60 NOT NULL,
	"depreciation_method" "depreciation_method" DEFAULT 'straight_line'::"depreciation_method" NOT NULL,
	"status" "asset_status" DEFAULT 'active'::"asset_status" NOT NULL,
	"accumulated_depreciation" numeric(19,4) DEFAULT '0' NOT NULL,
	"net_book_value" numeric(19,4) DEFAULT '0' NOT NULL,
	"gl_account_id" uuid,
	"is_depreciable" boolean DEFAULT true NOT NULL,
	"disposal_date" date,
	"disposal_proceeds" numeric(19,4),
	"created_by" uuid NOT NULL
);

CREATE TABLE "depreciation_schedules" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_depreciable_cost" numeric(19,4) NOT NULL,
	"monthly_amount" numeric(19,4) NOT NULL,
	"method" "depreciation_method" NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL
);

CREATE TABLE "depreciation_entries" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"schedule_id" uuid,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"depreciation_amount" numeric(19,4) NOT NULL,
	"accumulated_depreciation" numeric(19,4) NOT NULL,
	"net_book_value" numeric(19,4) NOT NULL,
	"journal_entry_id" uuid,
	"status" "depreciation_entry_status" DEFAULT 'draft'::"depreciation_entry_status" NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "asset_adjustments" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"adjustment_type" "asset_adjustment_type" NOT NULL,
	"adjustment_date" date NOT NULL,
	"adjustment_amount" numeric(19,4) NOT NULL,
	"direction" "adjustment_direction" NOT NULL,
	"journal_entry_id" uuid,
	"description" text NOT NULL,
	"revised_useful_life_months" integer,
	"revised_salvage_value" numeric(19,4),
	"status" "depreciation_entry_status" DEFAULT 'draft'::"depreciation_entry_status" NOT NULL,
	"created_by" uuid NOT NULL
);

CREATE TABLE "tax_codes" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "tax_type" NOT NULL,
	"gl_account_id" uuid NOT NULL,
	"is_claimable" boolean DEFAULT false NOT NULL,
	"posting_rule" "tax_posting_rule" DEFAULT 'output_liability'::"tax_posting_rule" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text
);

CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_code_id" uuid NOT NULL,
	"rate" numeric(7,4) NOT NULL,
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "tax_auto_assignment_rules" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"tax_code_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_category_id" uuid,
	"customer_group_id" uuid,
	"item_category_id" uuid,
	"region_code" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "budget_headers" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"description" text,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "budget_lines" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"budget_header_id" uuid NOT NULL,
	"gl_account_id" uuid NOT NULL,
	"description" varchar(200),
	"budget_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"consumed_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"variance_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "budget_consumptions" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"budget_line_id" uuid NOT NULL,
	"journal_entry_id" uuid,
	"amount" numeric(19,4) NOT NULL,
	"description" text,
	"consumption_date" date NOT NULL
);

-- ========================
-- INDEXES
-- ========================

CREATE INDEX "idx_ai_models_tenant_id" ON "ai_models" ("tenant_id");

CREATE INDEX "idx_ai_models_status" ON "ai_models" ("status");

CREATE INDEX "idx_ai_models_model_type" ON "ai_models" ("model_type");

CREATE INDEX "idx_anomaly_detections_model_id" ON "anomaly_detections" ("model_id");

CREATE INDEX "idx_anomaly_detections_tenant_id" ON "anomaly_detections" ("tenant_id");

CREATE INDEX "idx_anomaly_detections_severity" ON "anomaly_detections" ("severity");

CREATE INDEX "idx_anomaly_detections_status" ON "anomaly_detections" ("status");

CREATE INDEX "idx_anomaly_detections_detected_at" ON "anomaly_detections" ("detected_at");

CREATE INDEX "idx_predictions_model_id" ON "predictions" ("model_id");

CREATE INDEX "idx_predictions_prediction_type" ON "predictions" ("prediction_type");

CREATE INDEX "idx_predictions_tenant_id" ON "predictions" ("tenant_id");

CREATE INDEX "idx_predictions_entity_type" ON "predictions" ("entity_type");

CREATE INDEX "idx_training_data_source_type" ON "training_data" ("source_type");

CREATE INDEX "idx_workflow_steps_workflow_id" ON "workflow_steps" ("workflow_id");

CREATE INDEX "idx_workflow_steps_step_order" ON "workflow_steps" ("step_order");

CREATE INDEX "idx_workflows_tenant_id" ON "workflows" ("tenant_id");

CREATE INDEX "idx_workflows_status" ON "workflows" ("status");

CREATE INDEX "idx_workflows_created_by" ON "workflows" ("created_by");

CREATE INDEX "idx_workflows_trigger_type" ON "workflows" ("trigger_type");

CREATE INDEX "credentials_user_id_idx" ON "credentials" ("user_id");

CREATE UNIQUE INDEX "oauth_providers_provider_provider_id_unique" ON "oauth_providers" ("provider","provider_id");

CREATE INDEX "oauth_providers_user_id_idx" ON "oauth_providers" ("user_id");

CREATE UNIQUE INDEX "permissions_role_id_resource_action_unique" ON "permissions" ("role_id","resource","action");

CREATE UNIQUE INDEX "roles_tenant_id_name_unique" ON "roles" ("tenant_id","name");

CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");

CREATE UNIQUE INDEX "user_roles_user_id_role_id_unique" ON "user_roles" ("user_id","role_id");

CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");

CREATE UNIQUE INDEX "users_username_unique" ON "users" ("username");

CREATE UNIQUE INDEX "vendors_tenant_id_code_unique" ON "vendors" ("tenant_id","code");

CREATE UNIQUE INDEX "vendors_tenant_id_name_unique" ON "vendors" ("tenant_id","name");

CREATE INDEX "idx_bill_line_items_bill_id" ON "bill_line_items" ("bill_id");

CREATE UNIQUE INDEX "bills_vendor_id_bill_number_unique" ON "bills" ("vendor_id","bill_number");

CREATE INDEX "idx_bills_status" ON "bills" ("status");

CREATE INDEX "idx_bills_due_date" ON "bills" ("due_date");

CREATE INDEX "idx_payment_schedules_bill_id" ON "payment_schedules" ("bill_id");

CREATE INDEX "idx_payment_schedules_due_date" ON "payment_schedules" ("due_date");

CREATE INDEX "idx_vendor_payments_vendor_id" ON "vendor_payments" ("vendor_id");

CREATE INDEX "idx_vendor_payments_bill_id" ON "vendor_payments" ("bill_id");

CREATE INDEX "idx_vendor_payments_payment_date" ON "vendor_payments" ("payment_date");

CREATE INDEX "idx_customers_name" ON "customers" ("name");

CREATE INDEX "idx_customers_email" ON "customers" ("email");

CREATE INDEX "idx_credit_notes_customer_id" ON "credit_notes" ("customer_id");

CREATE INDEX "idx_credit_notes_status" ON "credit_notes" ("status");

CREATE INDEX "idx_invoices_customer_id" ON "invoices" ("customer_id");

CREATE INDEX "idx_invoices_status" ON "invoices" ("status");

CREATE INDEX "idx_invoices_issue_date" ON "invoices" ("issue_date");

CREATE INDEX "idx_invoices_due_date" ON "invoices" ("due_date");

CREATE INDEX "idx_invoice_line_items_invoice_id" ON "invoice_line_items" ("invoice_id");

CREATE INDEX "idx_payments_customer_id" ON "payments" ("customer_id");

CREATE INDEX "idx_payments_payment_date" ON "payments" ("payment_date");

CREATE INDEX "idx_payments_payment_method" ON "payments" ("payment_method");

CREATE INDEX "idx_payment_applications_payment_id" ON "payment_applications" ("payment_id");

CREATE INDEX "idx_payment_applications_invoice_id" ON "payment_applications" ("invoice_id");

CREATE INDEX "idx_bank_accounts_tenant_id" ON "bank_accounts" ("tenant_id");

CREATE INDEX "idx_bank_accounts_account_number" ON "bank_accounts" ("account_number");

CREATE INDEX "idx_bank_accounts_status" ON "bank_accounts" ("status");

CREATE INDEX "idx_bank_connections_tenant_id" ON "bank_connections" ("tenant_id");

CREATE INDEX "idx_bank_connections_bank_account_id" ON "bank_connections" ("bank_account_id");

CREATE INDEX "idx_bank_connections_status" ON "bank_connections" ("status");

CREATE INDEX "idx_bank_statements_tenant_id" ON "bank_statements" ("tenant_id");

CREATE INDEX "idx_bank_statements_bank_account_id" ON "bank_statements" ("bank_account_id");

CREATE INDEX "idx_bank_statements_statement_date" ON "bank_statements" ("statement_date");

CREATE INDEX "idx_bank_transfers_tenant_id" ON "bank_transfers" ("tenant_id");

CREATE INDEX "idx_bank_transfers_source_account_id" ON "bank_transfers" ("source_account_id");

CREATE INDEX "idx_bank_transfers_destination_account_id" ON "bank_transfers" ("destination_account_id");

CREATE INDEX "idx_bank_transfers_status" ON "bank_transfers" ("status");

CREATE INDEX "idx_reconciliation_entries_tenant_id" ON "reconciliation_entries" ("tenant_id");

CREATE INDEX "idx_reconciliation_entries_statement_id" ON "reconciliation_entries" ("statement_id");

CREATE INDEX "idx_reconciliation_entries_bank_account_id" ON "reconciliation_entries" ("bank_account_id");

CREATE INDEX "idx_reconciliation_entries_reconciliation_status" ON "reconciliation_entries" ("reconciliation_status");

CREATE INDEX "idx_accounts_type" ON "accounts" ("type");

CREATE INDEX "idx_accounts_parent_id" ON "accounts" ("parent_id");

CREATE INDEX "idx_accounts_is_active" ON "accounts" ("is_active");

CREATE INDEX "idx_fiscal_years_tenant_id" ON "fiscal_years" ("tenant_id");

CREATE INDEX "idx_fiscal_years_status" ON "fiscal_years" ("status");

CREATE INDEX "idx_journal_entries_date" ON "journal_entries" ("date");

CREATE INDEX "idx_journal_entries_status" ON "journal_entries" ("status");

CREATE INDEX "idx_journal_entries_created_by" ON "journal_entries" ("created_by");

CREATE INDEX "idx_journal_entry_lines_journal_entry_id" ON "journal_entry_lines" ("journal_entry_id");

CREATE INDEX "idx_journal_entry_lines_account_id" ON "journal_entry_lines" ("account_id");

CREATE INDEX "idx_audit_log_entries_tenant_id" ON "audit_log_entries" ("tenant_id");

CREATE INDEX "idx_audit_log_entries_user_id" ON "audit_log_entries" ("user_id");

CREATE INDEX "idx_audit_log_entries_resource_resource_id" ON "audit_log_entries" ("resource","resource_id");

CREATE INDEX "idx_audit_log_entries_action" ON "audit_log_entries" ("action");

CREATE INDEX "idx_audit_log_entries_created_at" ON "audit_log_entries" ("created_at");

CREATE INDEX "idx_attendance_employee_id" ON "attendance" ("employee_id");

CREATE INDEX "idx_attendance_date" ON "attendance" ("date");

CREATE INDEX "idx_attendance_status" ON "attendance" ("status");

CREATE UNIQUE INDEX "idx_attendance_employee_id_date" ON "attendance" ("employee_id","date");

CREATE INDEX "idx_departments_parent_id" ON "departments" ("parent_id");

CREATE INDEX "idx_departments_head_id" ON "departments" ("head_id");

CREATE INDEX "idx_departments_status" ON "departments" ("status");

CREATE INDEX "idx_designations_level" ON "designations" ("level");

CREATE INDEX "idx_designations_is_active" ON "designations" ("is_active");

CREATE INDEX "idx_employees_department_id" ON "employees" ("department_id");

CREATE INDEX "idx_employees_designation_id" ON "employees" ("designation_id");

CREATE INDEX "idx_employees_manager_id" ON "employees" ("manager_id");

CREATE INDEX "idx_employees_user_id" ON "employees" ("user_id");

CREATE INDEX "idx_employees_status" ON "employees" ("status");

CREATE INDEX "idx_employees_employment_type" ON "employees" ("employment_type");

CREATE INDEX "idx_leave_requests_employee_id" ON "leave_requests" ("employee_id");

CREATE INDEX "idx_leave_requests_leave_type_id" ON "leave_requests" ("leave_type_id");

CREATE INDEX "idx_leave_requests_approved_by" ON "leave_requests" ("approved_by");

CREATE INDEX "idx_leave_requests_status" ON "leave_requests" ("status");

CREATE INDEX "idx_leave_requests_start_date" ON "leave_requests" ("start_date");

CREATE INDEX "idx_leave_requests_end_date" ON "leave_requests" ("end_date");

CREATE INDEX "idx_leave_types_is_active" ON "leave_types" ("is_active");

CREATE INDEX "idx_payroll_employee_id" ON "payroll" ("employee_id");

CREATE INDEX "idx_payroll_status" ON "payroll" ("status");

CREATE INDEX "idx_payroll_pay_period_start" ON "payroll" ("pay_period_start");

CREATE INDEX "idx_payroll_pay_period_end" ON "payroll" ("pay_period_end");

CREATE INDEX "idx_payslips_employee_id" ON "payslips" ("employee_id");

CREATE INDEX "idx_payslips_payroll_id" ON "payslips" ("payroll_id");

CREATE INDEX "idx_salaries_is_active" ON "salaries" ("is_active");

CREATE INDEX "idx_salaries_effective_date" ON "salaries" ("effective_date");

CREATE UNIQUE INDEX "item_categories_tenant_id_code_unique" ON "item_categories" ("tenant_id","code");

CREATE INDEX "idx_item_categories_parent_id" ON "item_categories" ("parent_id");

CREATE INDEX "idx_item_categories_tenant_id" ON "item_categories" ("tenant_id");

CREATE INDEX "idx_items_category_id" ON "items" ("category_id");

CREATE INDEX "idx_items_unit_of_measure_id" ON "items" ("unit_of_measure_id");

CREATE INDEX "idx_items_tenant_id" ON "items" ("tenant_id");

CREATE INDEX "idx_items_barcode" ON "items" ("barcode");

CREATE INDEX "idx_unit_of_measures_category" ON "unit_of_measures" ("category");

CREATE UNIQUE INDEX "warehouses_tenant_id_code_unique" ON "warehouses" ("tenant_id","code");

CREATE INDEX "idx_warehouses_tenant_id" ON "warehouses" ("tenant_id");

CREATE INDEX "idx_stock_levels_tenant_id" ON "stock_levels" ("tenant_id");

CREATE INDEX "idx_stock_levels_item_id" ON "stock_levels" ("item_id");

CREATE INDEX "idx_stock_levels_warehouse_id" ON "stock_levels" ("warehouse_id");

CREATE INDEX "idx_stock_movements_item_id" ON "stock_movements" ("item_id");

CREATE INDEX "idx_stock_movements_warehouse_id" ON "stock_movements" ("warehouse_id");

CREATE INDEX "idx_stock_movements_movement_type" ON "stock_movements" ("movement_type");

CREATE INDEX "idx_stock_movements_movement_date" ON "stock_movements" ("movement_date");

CREATE INDEX "idx_stock_movements_tenant_id" ON "stock_movements" ("tenant_id");

CREATE INDEX "idx_po_line_items_po_id" ON "po_line_items" ("po_id");

CREATE INDEX "idx_po_line_items_item_id" ON "po_line_items" ("item_id");

CREATE INDEX "idx_purchase_orders_vendor_id" ON "purchase_orders" ("vendor_id");

CREATE INDEX "idx_purchase_orders_status" ON "purchase_orders" ("status");

CREATE INDEX "idx_purchase_orders_order_date" ON "purchase_orders" ("order_date");

CREATE INDEX "idx_receiving_reports_po_id" ON "receiving_reports" ("po_id");

CREATE INDEX "idx_receiving_reports_vendor_id" ON "receiving_reports" ("vendor_id");

CREATE INDEX "idx_receiving_reports_received_date" ON "receiving_reports" ("received_date");

CREATE UNIQUE INDEX "idx_vendor_catalog_items_vendor_code" ON "vendor_catalog_items" ("vendor_id","vendor_item_code");

CREATE INDEX "idx_report_templates_category" ON "report_templates" ("category");

CREATE INDEX "idx_report_templates_is_system" ON "report_templates" ("is_system");

CREATE INDEX "idx_reports_tenant_id" ON "reports" ("tenant_id");

CREATE INDEX "idx_reports_template_id" ON "reports" ("template_id");

CREATE INDEX "idx_reports_status" ON "reports" ("status");

CREATE INDEX "idx_reports_created_by" ON "reports" ("created_by");

CREATE INDEX "idx_dashboards_tenant_id" ON "dashboards" ("tenant_id");

CREATE INDEX "idx_dashboards_is_shared" ON "dashboards" ("is_shared");

CREATE INDEX "idx_dashboards_created_by" ON "dashboards" ("created_by");

CREATE INDEX "idx_data_sources_source_type" ON "data_sources" ("source_type");

CREATE INDEX "idx_data_sources_context_ref" ON "data_sources" ("context_ref");

CREATE INDEX "idx_data_sources_is_active" ON "data_sources" ("is_active");

CREATE INDEX "idx_kpis_tenant_id" ON "kpis" ("tenant_id");

CREATE INDEX "idx_kpis_metric_type" ON "kpis" ("metric_type");

CREATE INDEX "idx_kpis_created_by" ON "kpis" ("created_by");

CREATE INDEX "idx_report_exports_report_id" ON "report_exports" ("report_id");

CREATE INDEX "idx_report_exports_status" ON "report_exports" ("status");

CREATE INDEX "idx_report_exports_requested_by" ON "report_exports" ("requested_by");

CREATE INDEX "idx_report_schedules_report_id" ON "report_schedules" ("report_id");

CREATE INDEX "idx_report_schedules_tenant_id" ON "report_schedules" ("tenant_id");

CREATE INDEX "idx_report_schedules_is_active" ON "report_schedules" ("is_active");

CREATE INDEX "idx_discount_policies_customer_id" ON "discount_policies" ("customer_id");

CREATE INDEX "idx_discount_policies_valid_from" ON "discount_policies" ("valid_from");

CREATE INDEX "idx_quotation_line_items_quotation_id" ON "quotation_line_items" ("quotation_id");

CREATE INDEX "idx_quotation_line_items_item_id" ON "quotation_line_items" ("item_id");

CREATE INDEX "idx_quotations_customer_id" ON "quotations" ("customer_id");

CREATE INDEX "idx_quotations_status" ON "quotations" ("status");

CREATE INDEX "idx_quotations_issue_date" ON "quotations" ("issue_date");

CREATE INDEX "idx_sales_order_line_items_sales_order_id" ON "sales_order_line_items" ("sales_order_id");

CREATE INDEX "idx_sales_order_line_items_item_id" ON "sales_order_line_items" ("item_id");

CREATE INDEX "idx_sales_orders_customer_id" ON "sales_orders" ("customer_id");

CREATE INDEX "idx_sales_orders_status" ON "sales_orders" ("status");

CREATE INDEX "idx_sales_orders_order_date" ON "sales_orders" ("order_date");

CREATE INDEX "idx_asset_categories_tenant_id" ON "asset_categories" ("tenant_id");

CREATE INDEX "idx_asset_categories_code" ON "asset_categories" ("code");

CREATE INDEX "idx_fixed_assets_tenant_id" ON "fixed_assets" ("tenant_id");

CREATE INDEX "idx_fixed_assets_category_id" ON "fixed_assets" ("category_id");

CREATE INDEX "idx_fixed_assets_status" ON "fixed_assets" ("status");

CREATE INDEX "idx_fixed_assets_asset_number" ON "fixed_assets" ("asset_number");

CREATE INDEX "idx_depreciation_schedules_asset_id" ON "depreciation_schedules" ("asset_id");

CREATE INDEX "idx_depreciation_schedules_tenant_id" ON "depreciation_schedules" ("tenant_id");

CREATE INDEX "idx_depreciation_entries_asset_id" ON "depreciation_entries" ("asset_id");

CREATE INDEX "idx_depreciation_entries_schedule_id" ON "depreciation_entries" ("schedule_id");

CREATE INDEX "idx_depreciation_entries_tenant_id" ON "depreciation_entries" ("tenant_id");

CREATE INDEX "idx_depreciation_entries_status" ON "depreciation_entries" ("status");

CREATE INDEX "idx_asset_adjustments_asset_id" ON "asset_adjustments" ("asset_id");

CREATE INDEX "idx_asset_adjustments_tenant_id" ON "asset_adjustments" ("tenant_id");

CREATE INDEX "idx_tax_codes_tenant_id" ON "tax_codes" ("tenant_id");

CREATE INDEX "idx_tax_codes_code" ON "tax_codes" ("code");

CREATE INDEX "idx_tax_codes_type" ON "tax_codes" ("type");

CREATE INDEX "idx_tax_rates_tax_code_id" ON "tax_rates" ("tax_code_id");

CREATE INDEX "idx_tax_rates_effective_date" ON "tax_rates" ("effective_date");

CREATE INDEX "idx_tax_rates_tenant_id" ON "tax_rates" ("tenant_id");

CREATE INDEX "idx_tax_auto_assignment_rules_tenant_id" ON "tax_auto_assignment_rules" ("tenant_id");

CREATE INDEX "idx_tax_auto_assignment_rules_priority" ON "tax_auto_assignment_rules" ("priority");

CREATE INDEX "idx_budget_headers_tenant_id" ON "budget_headers" ("tenant_id");

CREATE INDEX "idx_budget_headers_period_start" ON "budget_headers" ("period_start");

CREATE INDEX "idx_budget_headers_status" ON "budget_headers" ("status");

CREATE INDEX "idx_budget_lines_budget_header_id" ON "budget_lines" ("budget_header_id");

CREATE INDEX "idx_budget_lines_gl_account_id" ON "budget_lines" ("gl_account_id");

CREATE INDEX "idx_budget_lines_tenant_id" ON "budget_lines" ("tenant_id");

CREATE INDEX "idx_budget_consumptions_budget_line_id" ON "budget_consumptions" ("budget_line_id");

CREATE INDEX "idx_budget_consumptions_tenant_id" ON "budget_consumptions" ("tenant_id");

-- ========================
-- FOREIGN KEYS
-- ========================

ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_training_data_id_training_data_id_fkey" FOREIGN KEY ("training_data_id") REFERENCES "training_data"("id");

ALTER TABLE "anomaly_detections" ADD CONSTRAINT "anomaly_detections_model_id_ai_models_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id");

ALTER TABLE "predictions" ADD CONSTRAINT "predictions_model_id_ai_models_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id");

ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_workflows_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE;

ALTER TABLE "bill_line_items" ADD CONSTRAINT "bill_line_items_bill_id_bills_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;

ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id");

ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_bill_id_bills_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id");

ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id");

ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_bill_id_bills_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id");

ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "payment_applications" ADD CONSTRAINT "payment_applications_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id");

ALTER TABLE "payment_applications" ADD CONSTRAINT "payment_applications_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");

ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_account_id_bank_accounts_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "mfa_config" ADD CONSTRAINT "mfa_config_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;

ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_bank_account_id_bank_accounts_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_bank_account_id_bank_accounts_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_source_account_id_bank_accounts_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_destination_account_id_bank_accounts_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "reconciliation_entries" ADD CONSTRAINT "reconciliation_entries_statement_id_bank_statements_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "bank_statements"("id");

ALTER TABLE "reconciliation_entries" ADD CONSTRAINT "reconciliation_entries_bank_account_id_bank_accounts_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parent_id_accounts_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "accounts"("id");

ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id");

ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");

ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");

ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_employees_id_fkey" FOREIGN KEY ("head_id") REFERENCES "employees"("id");

ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_departments_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id");

ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");

ALTER TABLE "employees" ADD CONSTRAINT "employees_designation_id_designations_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id");

ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id");

ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");

ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id");

ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");

ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");

ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_id_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payroll"("id");

ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");

ALTER TABLE "unit_of_measures" ADD CONSTRAINT "unit_of_measures_base_uom_id_unit_of_measures_id_fkey" FOREIGN KEY ("base_uom_id") REFERENCES "unit_of_measures"("id");

ALTER TABLE "item_categories" ADD CONSTRAINT "item_categories_parent_id_item_categories_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "item_categories"("id");

ALTER TABLE "items" ADD CONSTRAINT "items_category_id_item_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories"("id");

ALTER TABLE "items" ADD CONSTRAINT "items_unit_of_measure_id_unit_of_measures_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "unit_of_measures"("id");

ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");

ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_reference_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("reference_warehouse_id") REFERENCES "warehouses"("id");

ALTER TABLE "po_line_items" ADD CONSTRAINT "po_line_items_po_id_purchase_orders_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE;

ALTER TABLE "po_line_items" ADD CONSTRAINT "po_line_items_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id");

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_employees_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id");

ALTER TABLE "receiving_reports" ADD CONSTRAINT "receiving_reports_po_id_purchase_orders_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id");

ALTER TABLE "receiving_reports" ADD CONSTRAINT "receiving_reports_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id");

ALTER TABLE "receiving_reports" ADD CONSTRAINT "receiving_reports_received_by_employees_id_fkey" FOREIGN KEY ("received_by") REFERENCES "employees"("id");

ALTER TABLE "receiving_reports" ADD CONSTRAINT "receiving_reports_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");

ALTER TABLE "vendor_catalog_items" ADD CONSTRAINT "vendor_catalog_items_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id");

ALTER TABLE "vendor_catalog_items" ADD CONSTRAINT "vendor_catalog_items_internal_item_id_items_id_fkey" FOREIGN KEY ("internal_item_id") REFERENCES "items"("id");

ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_report_id_reports_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id");

ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_report_id_reports_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id");

ALTER TABLE "reports" ADD CONSTRAINT "reports_template_id_report_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "report_templates"("id");

ALTER TABLE "discount_policies" ADD CONSTRAINT "discount_policies_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_quotation_id_quotations_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE;

ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");

ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "sales_order_line_items" ADD CONSTRAINT "sales_order_line_items_sales_order_id_sales_orders_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE;

ALTER TABLE "sales_order_line_items" ADD CONSTRAINT "sales_order_line_items_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");

ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_category_id_asset_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id");

ALTER TABLE "depreciation_schedules" ADD CONSTRAINT "depreciation_schedules_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");

ALTER TABLE "depreciation_entries" ADD CONSTRAINT "depreciation_entries_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");

ALTER TABLE "depreciation_entries" ADD CONSTRAINT "depreciation_entries_schedule_id_depreciation_schedules_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "depreciation_schedules"("id");

ALTER TABLE "asset_adjustments" ADD CONSTRAINT "asset_adjustments_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");

ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tax_code_id_tax_codes_id_fkey" FOREIGN KEY ("tax_code_id") REFERENCES "tax_codes"("id");

ALTER TABLE "tax_auto_assignment_rules" ADD CONSTRAINT "tax_auto_assignment_rules_tax_code_id_tax_codes_id_fkey" FOREIGN KEY ("tax_code_id") REFERENCES "tax_codes"("id");

ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_header_id_budget_headers_id_fkey" FOREIGN KEY ("budget_header_id") REFERENCES "budget_headers"("id") ON DELETE CASCADE;

ALTER TABLE "budget_consumptions" ADD CONSTRAINT "budget_consumptions_budget_line_id_budget_lines_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "budget_lines"("id");
