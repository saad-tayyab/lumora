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
	} from '@lucide/svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	function runCommand(cmd: () => void) {
		open = false;
		cmd();
	}
</script>

<Command.Dialog bind:open placeholder="Search or type a command...">
	<Command.Input placeholder="Search or type a command..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>

		<Command.Group heading="Pages">
			<Command.Item onSelect={() => runCommand(() => goto('/dashboard'))}>
				<LayoutDashboard class="mr-2 h-4 w-4" />
				Dashboard
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial'))}>
				<FileText class="mr-2 h-4 w-4" />
				Financial
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				Accounts Receivable
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Accounts Payable
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv'))}>
				<Package class="mr-2 h-4 w-4" />
				Inventory
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/proc'))}>
				<ShoppingCart class="mr-2 h-4 w-4" />
				Procurement
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/sales'))}>
				<Briefcase class="mr-2 h-4 w-4" />
				Sales
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/hr'))}>
				<Users class="mr-2 h-4 w-4" />
				Human Resources
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/reports'))}>
				<BarChart3 class="mr-2 h-4 w-4" />
				Reports
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/settings'))}>
				<Settings class="mr-2 h-4 w-4" />
				Settings
			</Command.Item>
		</Command.Group>

		<Command.Separator />

		<Command.Group heading="Quick Actions">
			<Command.Item onSelect={() => runCommand(() => goto('/ar/invoices/new'))}>
				<FileText class="mr-2 h-4 w-4" />
				Create Invoice
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ap/bills/new'))}>
				<Receipt class="mr-2 h-4 w-4" />
				Record Bill
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/payments/new'))}>
				<CreditCard class="mr-2 h-4 w-4" />
				Record Payment
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/financial/journal-entries/new'))}>
				<FileText class="mr-2 h-4 w-4" />
				Journal Entry
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/ar/customers/new'))}>
				<Users class="mr-2 h-4 w-4" />
				New Customer
			</Command.Item>
			<Command.Item onSelect={() => runCommand(() => goto('/inv/items/new'))}>
				<Package class="mr-2 h-4 w-4" />
				New Item
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
