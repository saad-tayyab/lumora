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
			{ href: '/financial', label: 'Financial', icon: Landmark },
			{ href: '/ar', label: 'Accounts Receivable', icon: TrendingUp },
			{ href: '/ap', label: 'Accounts Payable', icon: TrendingDown },
			{ href: '/cash', label: 'Cash & Treasury', icon: Receipt },
		],
	},
	{
		label: 'Operations',
		items: [
			{ href: '/inv', label: 'Inventory', icon: Package },
			{ href: '/proc', label: 'Procurement', icon: ShoppingCart },
			{ href: '/sales', label: 'Sales', icon: Briefcase },
		],
	},
	{
		label: 'People',
		items: [{ href: '/hr', label: 'Human Resources', icon: Users }],
	},
	{
		label: 'Control',
		items: [
			{ href: '/assets', label: 'Fixed Assets', icon: Building2 },
			{ href: '/tax', label: 'Tax', icon: ClipboardList },
			{ href: '/budgets', label: 'Budgets', icon: FileText },
			{ href: '/audit', label: 'Audit Log', icon: Receipt },
		],
	},
	{
		label: 'Insights',
		items: [{ href: '/reports', label: 'Reports', icon: BarChart3 }],
	},
	{
		label: 'System',
		items: [{ href: '/settings', label: 'Settings', icon: Settings }],
	},
];

export const dashboardItem: NavItem = {
	href: '/dashboard',
	label: 'Dashboard',
	icon: LayoutDashboard,
};
