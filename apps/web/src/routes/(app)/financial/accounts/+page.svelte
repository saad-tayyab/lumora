<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountType } from '$lib/types';
	import { formatCurrency } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { badgeVariants } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function typeBadgeVariant(type: AccountType): 'secondary' | 'destructive' | 'default' | 'outline' {
		switch (type) {
			case 'asset': return 'default';
			case 'liability': return 'outline';
			case 'equity': return 'secondary';
			case 'revenue': return 'secondary';
			case 'expense': return 'destructive';
			default: return 'outline';
		}
	}

	let search = $state('');
	let filterType = $state<AccountType | ''>('');

	const filteredAccounts = $derived(
		data.accounts.filter((account) => {
			const matchesSearch =
				!search ||
				account.code.toLowerCase().includes(search.toLowerCase()) ||
				account.name.toLowerCase().includes(search.toLowerCase());
			const matchesType = !filterType || account.type === filterType;
			return matchesSearch && matchesType;
		}),
	);

	const columns: ColumnDef<(typeof data.accounts)[number], any>[] = [
		{
			accessorKey: 'code',
			header: 'Code',
			cell: ({ row }) => `<span class="font-mono">${(row as any).original.code}</span>`,
		},
		{
			accessorKey: 'name',
			header: 'Name',
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => {
				const variant = typeBadgeVariant((row as any).original.type as AccountType);
				return `<span class="${badgeVariants({ variant })}">${(row as any).original.type}</span>`;
			},
		},
		{
			accessorKey: 'isActive',
			header: 'Status',
			cell: ({ row }) => {
				const variant = (row as any).original.isActive ? 'secondary' : 'outline';
				const label = (row as any).original.isActive ? 'Active' : 'Inactive';
				return `<span class="${badgeVariants({ variant })}">${label}</span>`;
			},
		},
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Chart of Accounts</h1>
			<p class="mt-1 text-muted-foreground">Manage your financial accounts</p>
		</div>
		<Button href="/financial/accounts/new">New Account</Button>
	</div>

	<div class="flex gap-3">
		<Input
			type="text"
			placeholder="Search by code or name..."
			bind:value={search}
			class="flex-1"
		/>
		<Select.Root bind:value={filterType}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="All Types" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Types</Select.Item>
				<Select.Item value="asset">Asset</Select.Item>
				<Select.Item value="liability">Liability</Select.Item>
				<Select.Item value="equity">Equity</Select.Item>
				<Select.Item value="revenue">Revenue</Select.Item>
				<Select.Item value="expense">Expense</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={filteredAccounts}
				emptyMessage="No accounts found"
				pageSize={20}
				totalItems={data.accounts.length}
				onRowClick={(row) => goto(`/financial/accounts/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>

	<div class="text-sm text-muted-foreground">
		Showing {filteredAccounts.length} of {data.accounts.length} accounts
	</div>
</div>
