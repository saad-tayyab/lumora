CREATE TYPE "adjustment_direction" AS ENUM('increase', 'decrease');--> statement-breakpoint
CREATE TYPE "asset_adjustment_type" AS ENUM('revaluation', 'impairment', 'restoration', 'transfer', 'reclassification');--> statement-breakpoint
CREATE TYPE "asset_status" AS ENUM('active', 'fully_depreciated', 'disposed', 'under_construction');--> statement-breakpoint
CREATE TYPE "depreciation_entry_status" AS ENUM('draft', 'posted', 'voided');--> statement-breakpoint
CREATE TYPE "depreciation_method" AS ENUM('straight_line', 'declining_balance', 'units_of_activity', 'sum_of_years_digits');--> statement-breakpoint
CREATE TYPE "tax_posting_rule" AS ENUM('output_liability', 'input_asset', 'expense');--> statement-breakpoint
CREATE TYPE "tax_type" AS ENUM('sales_tax', 'vat', 'gst', 'excise', 'withholding');--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
DROP TABLE "audit_log";--> statement-breakpoint
CREATE INDEX "idx_asset_adjustments_asset_id" ON "asset_adjustments" ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_asset_adjustments_tenant_id" ON "asset_adjustments" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_asset_categories_tenant_id" ON "asset_categories" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_asset_categories_code" ON "asset_categories" ("code");--> statement-breakpoint
CREATE INDEX "idx_depreciation_entries_asset_id" ON "depreciation_entries" ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_depreciation_entries_schedule_id" ON "depreciation_entries" ("schedule_id");--> statement-breakpoint
CREATE INDEX "idx_depreciation_entries_tenant_id" ON "depreciation_entries" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_depreciation_entries_status" ON "depreciation_entries" ("status");--> statement-breakpoint
CREATE INDEX "idx_depreciation_schedules_asset_id" ON "depreciation_schedules" ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_depreciation_schedules_tenant_id" ON "depreciation_schedules" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fixed_assets_tenant_id" ON "fixed_assets" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fixed_assets_category_id" ON "fixed_assets" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_fixed_assets_status" ON "fixed_assets" ("status");--> statement-breakpoint
CREATE INDEX "idx_fixed_assets_asset_number" ON "fixed_assets" ("asset_number");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entries_tenant_id" ON "audit_log_entries" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entries_user_id" ON "audit_log_entries" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entries_resource_resource_id" ON "audit_log_entries" ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entries_action" ON "audit_log_entries" ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_log_entries_created_at" ON "audit_log_entries" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_budget_consumptions_budget_line_id" ON "budget_consumptions" ("budget_line_id");--> statement-breakpoint
CREATE INDEX "idx_budget_consumptions_tenant_id" ON "budget_consumptions" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_budget_headers_tenant_id" ON "budget_headers" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_budget_headers_period_start" ON "budget_headers" ("period_start");--> statement-breakpoint
CREATE INDEX "idx_budget_headers_status" ON "budget_headers" ("status");--> statement-breakpoint
CREATE INDEX "idx_budget_lines_budget_header_id" ON "budget_lines" ("budget_header_id");--> statement-breakpoint
CREATE INDEX "idx_budget_lines_gl_account_id" ON "budget_lines" ("gl_account_id");--> statement-breakpoint
CREATE INDEX "idx_budget_lines_tenant_id" ON "budget_lines" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tax_auto_assignment_rules_tenant_id" ON "tax_auto_assignment_rules" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tax_auto_assignment_rules_priority" ON "tax_auto_assignment_rules" ("priority");--> statement-breakpoint
CREATE INDEX "idx_tax_codes_tenant_id" ON "tax_codes" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tax_codes_code" ON "tax_codes" ("code");--> statement-breakpoint
CREATE INDEX "idx_tax_codes_type" ON "tax_codes" ("type");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_tax_code_id" ON "tax_rates" ("tax_code_id");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_effective_date" ON "tax_rates" ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_tax_rates_tenant_id" ON "tax_rates" ("tenant_id");--> statement-breakpoint
ALTER TABLE "asset_adjustments" ADD CONSTRAINT "asset_adjustments_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");--> statement-breakpoint
ALTER TABLE "depreciation_entries" ADD CONSTRAINT "depreciation_entries_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");--> statement-breakpoint
ALTER TABLE "depreciation_entries" ADD CONSTRAINT "depreciation_entries_schedule_id_depreciation_schedules_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "depreciation_schedules"("id");--> statement-breakpoint
ALTER TABLE "depreciation_schedules" ADD CONSTRAINT "depreciation_schedules_asset_id_fixed_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id");--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_category_id_asset_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id");--> statement-breakpoint
ALTER TABLE "budget_consumptions" ADD CONSTRAINT "budget_consumptions_budget_line_id_budget_lines_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "budget_lines"("id");--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_header_id_budget_headers_id_fkey" FOREIGN KEY ("budget_header_id") REFERENCES "budget_headers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tax_auto_assignment_rules" ADD CONSTRAINT "tax_auto_assignment_rules_tax_code_id_tax_codes_id_fkey" FOREIGN KEY ("tax_code_id") REFERENCES "tax_codes"("id");--> statement-breakpoint
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tax_code_id_tax_codes_id_fkey" FOREIGN KEY ("tax_code_id") REFERENCES "tax_codes"("id");