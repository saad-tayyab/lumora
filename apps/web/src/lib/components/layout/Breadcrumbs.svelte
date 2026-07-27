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
		variance: 'Variance',
		new: 'New',
		edit: 'Edit',
	};

	function isUUID(segment: string): boolean {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
			|| /^[0-9a-f]{20,}$/i.test(segment);
	}

	function getBreadcrumbs() {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		const crumbs: { label: string; href: string; isLast: boolean }[] = [];

		let currentPath = '';
		for (let i = 0; i < segments.length; i++) {
			currentPath += `/${segments[i]}`;
			const isLast = i === segments.length - 1;

			let label: string;
			if (segmentLabels[segments[i]]) {
				label = segmentLabels[segments[i]];
			} else if (isUUID(segments[i])) {
				label = 'Detail';
			} else if (segments[i].length > 20) {
				label = 'Detail';
			} else {
				label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' ');
			}

			crumbs.push({ label, href: currentPath, isLast });
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
			{#each crumbs.slice(1) as crumb}
				<Separator />
				<Item>
					{#if crumb.isLast}
						<Page>{crumb.label}</Page>
					{:else}
						<Link href={crumb.href}>{crumb.label}</Link>
					{/if}
				</Item>
			{/each}
		</List>
	</Root>
{/if}
