import {
	LayoutDashboard,
	Receipt,
	TrendingUp,
	TrendingDown,
	Landmark,
	Package,
	ShoppingCart,
	Briefcase,
	Users,
	Building2,
	FileText,
	ClipboardList,
	BarChart3,
	Settings,
	Scale,
	type LucideIcon,
} from '@lucide/svelte';

export interface NavItem {
	label: string;
	href: string;
	icon?: LucideIcon;
	badge?: string | number;
	children?: NavItem[];
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const navGroups: NavGroup[] = [
	{
		label: 'Finance',
		items: [
			{
				href: '/financial',
				label: 'Financial',
				icon: Landmark,
				children: [
					{ href: '/financial/accounts', label: 'Chart of Accounts' },
					{ href: '/financial/journal-entries', label: 'Journal Entries' },
					{ href: '/financial/fiscal-years', label: 'Fiscal Years' },
				],
			},
			{
				href: '/ar',
				label: 'Accounts Receivable',
				icon: TrendingUp,
				children: [
					{ href: '/ar/customers', label: 'Customers' },
					{ href: '/ar/invoices', label: 'Invoices' },
					{ href: '/ar/payments', label: 'Payments' },
					{ href: '/ar/credit-notes', label: 'Credit Notes' },
				],
			},
			{
				href: '/ap',
				label: 'Accounts Payable',
				icon: TrendingDown,
				children: [
					{ href: '/ap/vendors', label: 'Vendors' },
					{ href: '/ap/bills', label: 'Bills' },
					{ href: '/ap/payments', label: 'Payments' },
				],
			},
			{
				href: '/cash',
				label: 'Cash & Treasury',
				icon: Receipt,
				children: [
					{ href: '/cash/bank-accounts', label: 'Bank Accounts' },
					{ href: '/cash/transfers', label: 'Transfers' },
					{ href: '/cash/statements', label: 'Statements' },
					{ href: '/cash/reconciliation', label: 'Reconciliation' },
				],
			},
		],
	},
	{
		label: 'Operations',
		items: [
			{
				href: '/inv',
				label: 'Inventory',
				icon: Package,
				children: [
					{ href: '/inv/items', label: 'Items' },
					{ href: '/inv/warehouses', label: 'Warehouses' },
					{ href: '/inv/categories', label: 'Categories' },
					{ href: '/inv/stock-movements', label: 'Stock Movements' },
				],
			},
			{
				href: '/proc',
				label: 'Procurement',
				icon: ShoppingCart,
				children: [
					{ href: '/proc/purchase-orders', label: 'Purchase Orders' },
					{ href: '/proc/receiving-reports', label: 'Receiving Reports' },
					{ href: '/proc/vendor-catalog', label: 'Vendor Catalog' },
				],
			},
			{
				href: '/sales',
				label: 'Sales',
				icon: Briefcase,
				children: [
					{ href: '/sales/orders', label: 'Orders' },
					{ href: '/sales/quotations', label: 'Quotations' },
					{ href: '/sales/discount-policies', label: 'Discount Policies' },
				],
			},
		],
	},
	{
		label: 'People',
		items: [
			{
				href: '/hr',
				label: 'Human Resources',
				icon: Users,
				children: [
					{ href: '/hr/employees', label: 'Employees' },
					{ href: '/hr/departments', label: 'Departments' },
					{ href: '/hr/designations', label: 'Designations' },
					{ href: '/hr/attendance', label: 'Attendance' },
					{ href: '/hr/leave', label: 'Leave Requests' },
					{ href: '/hr/leave-types', label: 'Leave Types' },
					{ href: '/hr/payroll', label: 'Payroll' },
					{ href: '/hr/payslips', label: 'Payslips' },
					{ href: '/hr/salaries', label: 'Salaries' },
				],
			},
		],
	},
	{
		label: 'Accounting & Compliance',
		items: [
			{
				href: '/assets',
				label: 'Fixed Assets',
				icon: Building2,
				children: [
					{ href: '/assets/fixed-assets', label: 'Assets' },
					{ href: '/assets/categories', label: 'Categories' },
					{ href: '/assets/depreciation', label: 'Depreciation' },
					{ href: '/assets/depreciation-entries', label: 'Depreciation Entries' },
					{ href: '/assets/adjustments', label: 'Adjustments' },
				],
			},
			{
				href: '/tax',
				label: 'Tax',
				icon: ClipboardList,
				children: [
					{ href: '/tax/codes', label: 'Tax Codes' },
					{ href: '/tax/rates', label: 'Tax Rates' },
					{ href: '/tax/rules', label: 'Tax Rules' },
				],
			},
			{ href: '/budgets', label: 'Budgets', icon: FileText },
			{ href: '/audit', label: 'Audit Log', icon: Scale },
		],
	},
	{
		label: 'Analytics & System',
		items: [
			{ href: '/reports', label: 'Reports', icon: BarChart3 },
			{
				href: '/settings',
				label: 'Settings',
				icon: Settings,
				children: [
					{ href: '/settings/users', label: 'Users' },
					{ href: '/settings/roles', label: 'Roles' },
					{ href: '/settings/sessions', label: 'Sessions' },
				],
			},
		],
	},
];

export const dashboardItem: NavItem = {
	href: '/dashboard',
	label: 'Dashboard',
	icon: LayoutDashboard,
};
