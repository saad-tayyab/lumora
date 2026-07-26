
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(auth)" | "/(app)" | "/" | "/(app)/ap" | "/(app)/ap/bills" | "/(app)/ap/bills/new" | "/(app)/ap/bills/[id]" | "/(app)/ap/bills/[id]/edit" | "/(app)/ap/payments" | "/(app)/ap/payments/new" | "/(app)/ap/vendors" | "/(app)/ap/vendors/new" | "/(app)/ap/vendors/[id]" | "/(app)/ap/vendors/[id]/edit" | "/(app)/ar" | "/(app)/ar/credit-notes" | "/(app)/ar/credit-notes/new" | "/(app)/ar/credit-notes/[id]" | "/(app)/ar/customers" | "/(app)/ar/customers/new" | "/(app)/ar/customers/[id]" | "/(app)/ar/customers/[id]/edit" | "/(app)/ar/invoices" | "/(app)/ar/invoices/new" | "/(app)/ar/invoices/[id]" | "/(app)/ar/payments" | "/(app)/ar/payments/new" | "/(app)/assets" | "/(app)/assets/adjustments" | "/(app)/assets/adjustments/new" | "/(app)/assets/categories" | "/(app)/assets/categories/new" | "/(app)/assets/depreciation-entries" | "/(app)/assets/depreciation" | "/(app)/assets/fixed-assets" | "/(app)/assets/fixed-assets/new" | "/(app)/assets/fixed-assets/[id]" | "/(app)/assets/fixed-assets/[id]/edit" | "/(app)/audit" | "/(app)/audit/[id]" | "/(app)/budgets" | "/(app)/budgets/consumptions" | "/(app)/budgets/new" | "/(app)/budgets/[id]" | "/(app)/budgets/[id]/edit" | "/(app)/cash" | "/(app)/cash/bank-accounts" | "/(app)/cash/bank-accounts/new" | "/(app)/cash/bank-accounts/[id]" | "/(app)/cash/connections" | "/(app)/cash/reconciliation" | "/(app)/cash/statements" | "/(app)/cash/statements/new" | "/(app)/cash/transfers" | "/(app)/cash/transfers/new" | "/(app)/dashboard" | "/(app)/financial" | "/(app)/financial/accounts" | "/(app)/financial/accounts/new" | "/(app)/financial/accounts/[id]" | "/(app)/financial/accounts/[id]/edit" | "/(app)/financial/fiscal-years" | "/(app)/financial/fiscal-years/new" | "/(app)/financial/journal-entries" | "/(app)/financial/journal-entries/new" | "/(app)/financial/journal-entries/[id]" | "/(app)/hr" | "/(app)/hr/attendance" | "/(app)/hr/attendance/new" | "/(app)/hr/departments" | "/(app)/hr/departments/new" | "/(app)/hr/designations" | "/(app)/hr/designations/new" | "/(app)/hr/employees" | "/(app)/hr/employees/new" | "/(app)/hr/employees/[id]" | "/(app)/hr/employees/[id]/edit" | "/(app)/hr/leave-types" | "/(app)/hr/leave-types/new" | "/(app)/hr/leave" | "/(app)/hr/leave/new" | "/(app)/hr/payroll" | "/(app)/hr/payroll/new" | "/(app)/hr/payslips" | "/(app)/hr/salaries" | "/(app)/hr/salaries/new" | "/(app)/inv" | "/(app)/inv/categories" | "/(app)/inv/categories/new" | "/(app)/inv/items" | "/(app)/inv/items/new" | "/(app)/inv/items/[id]" | "/(app)/inv/items/[id]/edit" | "/(app)/inv/stock-movements" | "/(app)/inv/stock-movements/new" | "/(app)/inv/warehouses" | "/(app)/inv/warehouses/new" | "/(app)/inv/warehouses/[id]" | "/(auth)/login" | "/(app)/proc" | "/(app)/proc/purchase-orders" | "/(app)/proc/purchase-orders/new" | "/(app)/proc/purchase-orders/[id]" | "/(app)/proc/purchase-orders/[id]/edit" | "/(app)/proc/receiving-reports" | "/(app)/proc/receiving-reports/new" | "/(app)/proc/receiving-reports/[id]" | "/(app)/proc/vendor-catalog" | "/(app)/proc/vendor-catalog/new" | "/(auth)/register" | "/(app)/reports" | "/(app)/reports/financial" | "/(app)/reports/operational" | "/(app)/sales" | "/(app)/sales/discount-policies" | "/(app)/sales/discount-policies/new" | "/(app)/sales/orders" | "/(app)/sales/orders/new" | "/(app)/sales/orders/[id]" | "/(app)/sales/orders/[id]/edit" | "/(app)/sales/quotations" | "/(app)/sales/quotations/new" | "/(app)/sales/quotations/[id]" | "/(app)/sales/quotations/[id]/edit" | "/(app)/settings" | "/(app)/settings/apps" | "/(app)/settings/apps/web" | "/(app)/settings/apps/web/src" | "/(app)/settings/apps/web/src/routes/(app)" | "/(app)/settings/apps/web/src/routes" | "/(app)/settings/apps/web/src/routes/(app)/settings" | "/(app)/settings/apps/web/src/routes/(app)/settings/users" | "/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]" | "/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]/edit" | "/(app)/settings/roles" | "/(app)/settings/roles/new" | "/(app)/settings/sessions" | "/(app)/settings/users" | "/(app)/settings/users/new" | "/(app)/settings/users/[id]" | "/(app)/settings/users/[id]/edit" | "/(app)/tax" | "/(app)/tax/codes" | "/(app)/tax/codes/new" | "/(app)/tax/codes/[id]" | "/(app)/tax/rates" | "/(app)/tax/rates/new" | "/(app)/tax/rules" | "/(app)/tax/rules/new";
		RouteParams(): {
			"/(app)/ap/bills/[id]": { id: string };
			"/(app)/ap/bills/[id]/edit": { id: string };
			"/(app)/ap/vendors/[id]": { id: string };
			"/(app)/ap/vendors/[id]/edit": { id: string };
			"/(app)/ar/credit-notes/[id]": { id: string };
			"/(app)/ar/customers/[id]": { id: string };
			"/(app)/ar/customers/[id]/edit": { id: string };
			"/(app)/ar/invoices/[id]": { id: string };
			"/(app)/assets/fixed-assets/[id]": { id: string };
			"/(app)/assets/fixed-assets/[id]/edit": { id: string };
			"/(app)/audit/[id]": { id: string };
			"/(app)/budgets/[id]": { id: string };
			"/(app)/budgets/[id]/edit": { id: string };
			"/(app)/cash/bank-accounts/[id]": { id: string };
			"/(app)/financial/accounts/[id]": { id: string };
			"/(app)/financial/accounts/[id]/edit": { id: string };
			"/(app)/financial/journal-entries/[id]": { id: string };
			"/(app)/hr/employees/[id]": { id: string };
			"/(app)/hr/employees/[id]/edit": { id: string };
			"/(app)/inv/items/[id]": { id: string };
			"/(app)/inv/items/[id]/edit": { id: string };
			"/(app)/inv/warehouses/[id]": { id: string };
			"/(app)/proc/purchase-orders/[id]": { id: string };
			"/(app)/proc/purchase-orders/[id]/edit": { id: string };
			"/(app)/proc/receiving-reports/[id]": { id: string };
			"/(app)/sales/orders/[id]": { id: string };
			"/(app)/sales/orders/[id]/edit": { id: string };
			"/(app)/sales/quotations/[id]": { id: string };
			"/(app)/sales/quotations/[id]/edit": { id: string };
			"/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]": { id: string };
			"/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]/edit": { id: string };
			"/(app)/settings/users/[id]": { id: string };
			"/(app)/settings/users/[id]/edit": { id: string };
			"/(app)/tax/codes/[id]": { id: string }
		};
		LayoutParams(): {
			"/(auth)": Record<string, never>;
			"/(app)": { id?: string | undefined };
			"/": { id?: string | undefined };
			"/(app)/ap": { id?: string | undefined };
			"/(app)/ap/bills": { id?: string | undefined };
			"/(app)/ap/bills/new": Record<string, never>;
			"/(app)/ap/bills/[id]": { id: string };
			"/(app)/ap/bills/[id]/edit": { id: string };
			"/(app)/ap/payments": Record<string, never>;
			"/(app)/ap/payments/new": Record<string, never>;
			"/(app)/ap/vendors": { id?: string | undefined };
			"/(app)/ap/vendors/new": Record<string, never>;
			"/(app)/ap/vendors/[id]": { id: string };
			"/(app)/ap/vendors/[id]/edit": { id: string };
			"/(app)/ar": { id?: string | undefined };
			"/(app)/ar/credit-notes": { id?: string | undefined };
			"/(app)/ar/credit-notes/new": Record<string, never>;
			"/(app)/ar/credit-notes/[id]": { id: string };
			"/(app)/ar/customers": { id?: string | undefined };
			"/(app)/ar/customers/new": Record<string, never>;
			"/(app)/ar/customers/[id]": { id: string };
			"/(app)/ar/customers/[id]/edit": { id: string };
			"/(app)/ar/invoices": { id?: string | undefined };
			"/(app)/ar/invoices/new": Record<string, never>;
			"/(app)/ar/invoices/[id]": { id: string };
			"/(app)/ar/payments": Record<string, never>;
			"/(app)/ar/payments/new": Record<string, never>;
			"/(app)/assets": { id?: string | undefined };
			"/(app)/assets/adjustments": Record<string, never>;
			"/(app)/assets/adjustments/new": Record<string, never>;
			"/(app)/assets/categories": Record<string, never>;
			"/(app)/assets/categories/new": Record<string, never>;
			"/(app)/assets/depreciation-entries": Record<string, never>;
			"/(app)/assets/depreciation": Record<string, never>;
			"/(app)/assets/fixed-assets": { id?: string | undefined };
			"/(app)/assets/fixed-assets/new": Record<string, never>;
			"/(app)/assets/fixed-assets/[id]": { id: string };
			"/(app)/assets/fixed-assets/[id]/edit": { id: string };
			"/(app)/audit": { id?: string | undefined };
			"/(app)/audit/[id]": { id: string };
			"/(app)/budgets": { id?: string | undefined };
			"/(app)/budgets/consumptions": Record<string, never>;
			"/(app)/budgets/new": Record<string, never>;
			"/(app)/budgets/[id]": { id: string };
			"/(app)/budgets/[id]/edit": { id: string };
			"/(app)/cash": { id?: string | undefined };
			"/(app)/cash/bank-accounts": { id?: string | undefined };
			"/(app)/cash/bank-accounts/new": Record<string, never>;
			"/(app)/cash/bank-accounts/[id]": { id: string };
			"/(app)/cash/connections": Record<string, never>;
			"/(app)/cash/reconciliation": Record<string, never>;
			"/(app)/cash/statements": Record<string, never>;
			"/(app)/cash/statements/new": Record<string, never>;
			"/(app)/cash/transfers": Record<string, never>;
			"/(app)/cash/transfers/new": Record<string, never>;
			"/(app)/dashboard": Record<string, never>;
			"/(app)/financial": { id?: string | undefined };
			"/(app)/financial/accounts": { id?: string | undefined };
			"/(app)/financial/accounts/new": Record<string, never>;
			"/(app)/financial/accounts/[id]": { id: string };
			"/(app)/financial/accounts/[id]/edit": { id: string };
			"/(app)/financial/fiscal-years": Record<string, never>;
			"/(app)/financial/fiscal-years/new": Record<string, never>;
			"/(app)/financial/journal-entries": { id?: string | undefined };
			"/(app)/financial/journal-entries/new": Record<string, never>;
			"/(app)/financial/journal-entries/[id]": { id: string };
			"/(app)/hr": { id?: string | undefined };
			"/(app)/hr/attendance": Record<string, never>;
			"/(app)/hr/attendance/new": Record<string, never>;
			"/(app)/hr/departments": Record<string, never>;
			"/(app)/hr/departments/new": Record<string, never>;
			"/(app)/hr/designations": Record<string, never>;
			"/(app)/hr/designations/new": Record<string, never>;
			"/(app)/hr/employees": { id?: string | undefined };
			"/(app)/hr/employees/new": Record<string, never>;
			"/(app)/hr/employees/[id]": { id: string };
			"/(app)/hr/employees/[id]/edit": { id: string };
			"/(app)/hr/leave-types": Record<string, never>;
			"/(app)/hr/leave-types/new": Record<string, never>;
			"/(app)/hr/leave": Record<string, never>;
			"/(app)/hr/leave/new": Record<string, never>;
			"/(app)/hr/payroll": Record<string, never>;
			"/(app)/hr/payroll/new": Record<string, never>;
			"/(app)/hr/payslips": Record<string, never>;
			"/(app)/hr/salaries": Record<string, never>;
			"/(app)/hr/salaries/new": Record<string, never>;
			"/(app)/inv": { id?: string | undefined };
			"/(app)/inv/categories": Record<string, never>;
			"/(app)/inv/categories/new": Record<string, never>;
			"/(app)/inv/items": { id?: string | undefined };
			"/(app)/inv/items/new": Record<string, never>;
			"/(app)/inv/items/[id]": { id: string };
			"/(app)/inv/items/[id]/edit": { id: string };
			"/(app)/inv/stock-movements": Record<string, never>;
			"/(app)/inv/stock-movements/new": Record<string, never>;
			"/(app)/inv/warehouses": { id?: string | undefined };
			"/(app)/inv/warehouses/new": Record<string, never>;
			"/(app)/inv/warehouses/[id]": { id: string };
			"/(auth)/login": Record<string, never>;
			"/(app)/proc": { id?: string | undefined };
			"/(app)/proc/purchase-orders": { id?: string | undefined };
			"/(app)/proc/purchase-orders/new": Record<string, never>;
			"/(app)/proc/purchase-orders/[id]": { id: string };
			"/(app)/proc/purchase-orders/[id]/edit": { id: string };
			"/(app)/proc/receiving-reports": { id?: string | undefined };
			"/(app)/proc/receiving-reports/new": Record<string, never>;
			"/(app)/proc/receiving-reports/[id]": { id: string };
			"/(app)/proc/vendor-catalog": Record<string, never>;
			"/(app)/proc/vendor-catalog/new": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(app)/reports": Record<string, never>;
			"/(app)/reports/financial": Record<string, never>;
			"/(app)/reports/operational": Record<string, never>;
			"/(app)/sales": { id?: string | undefined };
			"/(app)/sales/discount-policies": Record<string, never>;
			"/(app)/sales/discount-policies/new": Record<string, never>;
			"/(app)/sales/orders": { id?: string | undefined };
			"/(app)/sales/orders/new": Record<string, never>;
			"/(app)/sales/orders/[id]": { id: string };
			"/(app)/sales/orders/[id]/edit": { id: string };
			"/(app)/sales/quotations": { id?: string | undefined };
			"/(app)/sales/quotations/new": Record<string, never>;
			"/(app)/sales/quotations/[id]": { id: string };
			"/(app)/sales/quotations/[id]/edit": { id: string };
			"/(app)/settings": { id?: string | undefined };
			"/(app)/settings/apps": { id?: string | undefined };
			"/(app)/settings/apps/web": { id?: string | undefined };
			"/(app)/settings/apps/web/src": { id?: string | undefined };
			"/(app)/settings/apps/web/src/routes/(app)": { id?: string | undefined };
			"/(app)/settings/apps/web/src/routes": { id?: string | undefined };
			"/(app)/settings/apps/web/src/routes/(app)/settings": { id?: string | undefined };
			"/(app)/settings/apps/web/src/routes/(app)/settings/users": { id?: string | undefined };
			"/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]": { id: string };
			"/(app)/settings/apps/web/src/routes/(app)/settings/users/[id]/edit": { id: string };
			"/(app)/settings/roles": Record<string, never>;
			"/(app)/settings/roles/new": Record<string, never>;
			"/(app)/settings/sessions": Record<string, never>;
			"/(app)/settings/users": { id?: string | undefined };
			"/(app)/settings/users/new": Record<string, never>;
			"/(app)/settings/users/[id]": { id: string };
			"/(app)/settings/users/[id]/edit": { id: string };
			"/(app)/tax": { id?: string | undefined };
			"/(app)/tax/codes": { id?: string | undefined };
			"/(app)/tax/codes/new": Record<string, never>;
			"/(app)/tax/codes/[id]": { id: string };
			"/(app)/tax/rates": Record<string, never>;
			"/(app)/tax/rates/new": Record<string, never>;
			"/(app)/tax/rules": Record<string, never>;
			"/(app)/tax/rules/new": Record<string, never>
		};
		Pathname(): "/" | "/ap" | "/ap/bills" | "/ap/bills/new" | `/ap/bills/${string}` & {} | `/ap/bills/${string}/edit` & {} | "/ap/payments" | "/ap/payments/new" | "/ap/vendors" | "/ap/vendors/new" | `/ap/vendors/${string}` & {} | `/ap/vendors/${string}/edit` & {} | "/ar" | "/ar/credit-notes" | "/ar/credit-notes/new" | `/ar/credit-notes/${string}` & {} | "/ar/customers" | "/ar/customers/new" | `/ar/customers/${string}` & {} | `/ar/customers/${string}/edit` & {} | "/ar/invoices" | "/ar/invoices/new" | `/ar/invoices/${string}` & {} | "/ar/payments" | "/ar/payments/new" | "/assets" | "/assets/adjustments" | "/assets/adjustments/new" | "/assets/categories" | "/assets/categories/new" | "/assets/depreciation-entries" | "/assets/depreciation" | "/assets/fixed-assets" | "/assets/fixed-assets/new" | `/assets/fixed-assets/${string}` & {} | `/assets/fixed-assets/${string}/edit` & {} | "/audit" | `/audit/${string}` & {} | "/budgets" | "/budgets/consumptions" | "/budgets/new" | `/budgets/${string}` & {} | `/budgets/${string}/edit` & {} | "/cash" | "/cash/bank-accounts" | "/cash/bank-accounts/new" | `/cash/bank-accounts/${string}` & {} | "/cash/reconciliation" | "/cash/statements" | "/cash/transfers" | "/cash/transfers/new" | "/dashboard" | "/financial" | "/financial/accounts" | "/financial/accounts/new" | `/financial/accounts/${string}` & {} | `/financial/accounts/${string}/edit` & {} | "/financial/fiscal-years" | "/financial/fiscal-years/new" | "/financial/journal-entries" | "/financial/journal-entries/new" | `/financial/journal-entries/${string}` & {} | "/hr" | "/hr/attendance" | "/hr/departments" | "/hr/designations" | "/hr/employees" | "/hr/employees/new" | `/hr/employees/${string}` & {} | "/hr/leave" | "/hr/payroll" | "/hr/payslips" | "/hr/salaries" | "/inv" | "/inv/categories" | "/inv/categories/new" | "/inv/items" | "/inv/items/new" | `/inv/items/${string}` & {} | `/inv/items/${string}/edit` & {} | "/inv/stock-movements" | "/inv/stock-movements/new" | "/inv/warehouses" | "/inv/warehouses/new" | "/login" | "/proc" | "/proc/purchase-orders" | "/proc/purchase-orders/new" | `/proc/purchase-orders/${string}` & {} | `/proc/purchase-orders/${string}/edit` & {} | "/proc/receiving-reports" | "/proc/receiving-reports/new" | "/proc/vendor-catalog" | "/proc/vendor-catalog/new" | "/register" | "/reports" | "/reports/financial" | "/reports/operational" | "/sales" | "/sales/discount-policies" | "/sales/discount-policies/new" | "/sales/orders" | "/sales/orders/new" | `/sales/orders/${string}` & {} | "/sales/quotations" | "/sales/quotations/new" | `/sales/quotations/${string}` & {} | "/settings" | "/settings/roles" | "/settings/roles/new" | "/settings/sessions" | "/settings/users" | "/settings/users/new" | `/settings/users/${string}` & {} | `/settings/users/${string}/edit` & {} | "/tax" | "/tax/codes" | "/tax/codes/new" | `/tax/codes/${string}` & {} | "/tax/rates" | "/tax/rates/new" | "/tax/rules" | "/tax/rules/new";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}