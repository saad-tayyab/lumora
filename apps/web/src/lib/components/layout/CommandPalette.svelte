<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Command from '$lib/components/ui/command';
	import {
		FileText,
		Users,
		CreditCard,
		Receipt,
		Package,
		ShoppingCart,
		Briefcase,
		BarChart3,
		Settings,
		LayoutDashboard,
		Building2,
		ClipboardList,
		Landmark,
		Scale,
	} from '@lucide/svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	function runCommand(cmd: () => void) {
		open = false;
		cmd();
	}
</script>

<Command.Dialog bind:open placeholder="Search pages, actions, or type a command...">
	<Command.Input placeholder="Search pages, actions, or type a command..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>

		<Command.Group heading="Dashboard">
			<Command.Item onSelect={() => runCommand(() => goto('/dashboard'))}>
				<LayoutDashboard class="mr-2 h-4 w-4" />
				Dashboard
			</Command.Item>
		</Command.Group>

		<Command.Group heading="Finance">
			<Command.Item onSelect={() => runCommand(() => goto('/financial/accounts'))}>
				<Landmark class="mr-2 h-4 w-4" />
				Chart of Accounts
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial/journal-entries'))}>
				<FileText class="mr-2 h-4 w-4" />
				Journal Entries
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial/fiscal-years'))}>
				<FileText class="mr-2 h-4 w-4" />
				Fiscal Years
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/customers'))}>
				<Users class="mr-2 h-4 w-4" />
				AR Customers
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/invoices'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				AR Invoices
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/payments'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				AR Payments
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/credit-notes'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				Credit Notes
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/vendors'))}>
				<Receipt class="mr-2 h-4 w-4" />
				AP Vendors
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/bills'))}>
				<Receipt class="mr-2 h-4 w-4" />
				AP Bills
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/payments'))}>
				<Receipt class="mr-2 h-4 w-4" />
				AP Payments
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/cash/bank-accounts'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Bank Accounts
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/cash/transfers'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Transfers
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/cash/reconciliation'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Reconciliation
			</Command.Item>
		</Command.Group>

		<Command.Group heading="Operations">
			<Command.Item onSelect={() => runCommand(() => goto('/inv/items'))}>
				<Package class="mr-2 h-4 w-4" />
				Inventory Items
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/warehouses'))}>
				<Package class="mr-2 h-4 w-4" />
				Warehouses
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/stock-movements'))}>
				<Package class="mr-2 h-4 w-4" />
				Stock Movements
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/proc/purchase-orders'))}>
				<ShoppingCart class="mr-2 h-4 w-4" />
				Purchase Orders
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/proc/receiving-reports'))}>
				<ShoppingCart class="mr-2 h-4 w-4" />
				Receiving Reports
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/proc/vendor-catalog'))}>
				<ShoppingCart class="mr-2 h-4 w-4" />
				Vendor Catalog
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales/orders'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				Sales Orders
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales/quotations'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				Quotations
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales/discount-policies'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				Discount Policies
			</Command.Item>
		</Command.Group>

		<Command.Group heading="People">
			<Command.Item onSelect={() => runCommand(() => goto('/hr/employees'))}>
				<Users class="mr-2 h-4 w-4" />
				Employees
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/departments'))}>
				<Users class="mr-2 h-4 w-4" />
				Departments
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/attendance'))}>
				<Users class="mr-2 h-4 w-4" />
				Attendance
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/leave'))}>
				<Users class="mr-2 h-4 w-4" />
				Leave Requests
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/payroll'))}>
				<Users class="mr-2 h-4 w-4" />
				Payroll
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/salaries'))}>
				<Users class="mr-2 h-4 w-4" />
				Salaries
			</Command.Item>
		</Command.Group>

		<Command.Group heading="Accounting & Compliance">
			<Command.Item onSelect={() => runCommand(() => goto('/assets/fixed-assets'))}>
				<Building2 class="mr-2 h-4 w-4" />
				Fixed Assets
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/assets/depreciation'))}>
				<Building2 class="mr-2 h-4 w-4" />
				Depreciation
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/tax/codes'))}>
				<ClipboardList class="mr-2 h-4 w-4" />
				Tax Codes
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/tax/rates'))}>
				<ClipboardList class="mr-2 h-4 w-4" />
				Tax Rates
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/budgets'))}>
				<FileText class="mr-2 h-4 w-4" />
				Budgets
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/audit'))}>
				<Scale class="mr-2 h-4 w-4" />
				Audit Log
			</Command.Item>
		</Command.Group>

		<Command.Group heading="Analytics & System">
			<Command.Item onSelect={() => runCommand(() => goto('/reports/financial'))}>
				<BarChart3 class="mr-2 h-4 w-4" />
				Financial Reports
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/reports/operational'))}>
				<BarChart3 class="mr-2 h-4 w-4" />
				Operational Reports
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings/users'))}>
				<Settings class="mr-2 h-4 w-4" />
				Users
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings/roles'))}>
				<Settings class="mr-2 h-4 w-4" />
				Roles & Permissions
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings/sessions'))}>
				<Settings class="mr-2 h-4 w-4" />
				Sessions
			</Command.Item>
		</Command.Group>

		<Command.Separator />

		<Command.Group heading="Quick Actions — Create">
			<Command.Item onSelect={() => runCommand(() => goto('/ar/invoices/new'))}>
				<FileText class="mr-2 h-4 w-4" />
				Create Invoice
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/customers/new'))}>
				<Users class="mr-2 h-4 w-4" />
				New Customer
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/payments/new'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				Record AR Payment
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/credit-notes/new'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				Create Credit Note
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/vendors/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				New Vendor
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/bills/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Record Bill
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/payments/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Record AP Payment
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial/journal-entries/new'))}>
				<FileText class="mr-2 h-4 w-4" />
				Journal Entry
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial/accounts/new'))}>
				<Landmark class="mr-2 h-4 w-4" />
				New Account
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/cash/bank-accounts/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				New Bank Account
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/cash/transfers/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				New Transfer
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/items/new'))}>
				<Package class="mr-2 h-4 w-4" />
				New Item
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/warehouses/new'))}>
				<Package class="mr-2 h-4 w-4" />
				New Warehouse
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/stock-movements/new'))}>
				<Package class="mr-2 h-4 w-4" />
				Record Stock Movement
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/proc/purchase-orders/new'))}>
				<ShoppingCart class="mr-2 h-4 w-4" />
				New Purchase Order
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales/orders/new'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				New Sales Order
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales/quotations/new'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				New Quotation
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr/employees/new'))}>
				<Users class="mr-2 h-4 w-4" />
				New Employee
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/assets/fixed-assets/new'))}>
				<Building2 class="mr-2 h-4 w-4" />
				New Fixed Asset
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/tax/codes/new'))}>
				<ClipboardList class="mr-2 h-4 w-4" />
				New Tax Code
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/budgets/new'))}>
				<FileText class="mr-2 h-4 w-4" />
				New Budget
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings/users/new'))}>
				<Settings class="mr-2 h-4 w-4" />
				New User
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings/roles/new'))}>
				<Settings class="mr-2 h-4 w-4" />
				New Role
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
