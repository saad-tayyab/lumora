<script lang="ts">
	import { page } from '$app/stores';
	import {
		Root,
		List,
		Item,
		Link,
		Page,
		Separator,
	} from '$lib/components/ui/breadcrumb';

	const segmentLabels: Record<string, string> = {
		dashboard: 'Dashboard',
		financial: 'Financial',
		ar: 'Accounts Receivable',
		ap: 'Accounts Payable',
		cash: 'Cash & Treasury',
		inv: 'Inventory',
		proc: 'Procurement',
		sales: 'Sales',
		hr: 'Human Resources',
		assets: 'Fixed Assets',
		tax: 'Tax',
		budgets: 'Budgets',
		audit: 'Audit Log',
		reports: 'Reports',
		settings: 'Settings',
		customers: 'Customers',
		invoices: 'Invoices',
		payments: 'Payments',
		'credit-notes': 'Credit Notes',
		vendors: 'Vendors',
		bills: 'Bills',
		'bank-accounts': 'Bank Accounts',
		transfers: 'Transfers',
		reconciliation: 'Reconciliation',
		statements: 'Statements',
		items: 'Items',
		warehouses: 'Warehouses',
		categories: 'Categories',
		'stock-movements': 'Stock Movements',
		'purchase-orders': 'Purchase Orders',
		'receiving-reports': 'Receiving Reports',
		'vendor-catalog': 'Vendor Catalog',
		quotations: 'Quotations',
		orders: 'Orders',
		'discount-policies': 'Discount Policies',
		employees: 'Employees',
		departments: 'Departments',
		designations: 'Designations',
		attendance: 'Attendance',
		leave: 'Leave',
		'leave-types': 'Leave Types',
		payroll: 'Payroll',
		payslips: 'Payslips',
		salaries: 'Salaries',
		'fixed-assets': 'Fixed Assets',
		depreciation: 'Depreciation',
		'depreciation-entries': 'Depreciation Entries',
		adjustments: 'Adjustments',
		codes: 'Codes',
		rates: 'Rates',
		rules: 'Rules',
		accounts: 'Accounts',
		'journal-entries': 'Journal Entries',
		'fiscal-years': 'Fiscal Years',
		users: 'Users',
		roles: 'Roles',
		sessions: 'Sessions',
		consumptions: 'Consumptions',
		new: 'New',
		edit: 'Edit',
	};

	function getBreadcrumbs() {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		const crumbs: { label: string; href: string }[] = [];

		let currentPath = '';
		for (const segment of segments) {
			currentPath += `/${segment}`;
			const label = segmentLabels[segment] || (segment.length > 8 ? `${segment.slice(0, 8)}...` : segment);
			crumbs.push({ label, href: currentPath });
		}

		return crumbs;
	}

	let crumbs = $derived(getBreadcrumbs());
</script>

{#if crumbs.length > 1}
	<Root>
		<List>
			<Item>
				<Link href="/dashboard">Home</Link>
			</Item>
			{#each crumbs.slice(1) as crumb, i}
				<Separator />
				<Item>
					{#if i === crumbs.length - 2}
						<Page>{crumb.label}</Page>
					{:else}
						<Link href={crumb.href}>{crumb.label}</Link>
					{/if}
				</Item>
			{/each}
		</List>
	</Root>
{/if}
