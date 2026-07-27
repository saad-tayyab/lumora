<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountType } from '$lib/types';
	import { formatCurrency } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent } from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const typeBadgeColors: Record<AccountType, string> = {
		asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		liability: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
		revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		expense: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
	};

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
				const cls = typeBadgeColors[(row as any).original.type as AccountType] || '';
				return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${(row as any).original.type}</span>`;
			},
		},
		{
			accessorKey: 'isActive',
			header: 'Status',
			cell: ({ row }) => {
				const cls = (row as any).original.isActive
					? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
					: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
				const label = (row as any).original.isActive ? 'Active' : 'Inactive';
				return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${label}</span>`;
			},
		},
	];
</script>

<div class="space-y-6">
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
		<select
			bind:value={filterType}
			class="rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
		>
			<option value="">All Types</option>
			<option value="asset">Asset</option>
			<option value="liability">Liability</option>
			<option value="equity">Equity</option>
			<option value="revenue">Revenue</option>
			<option value="expense">Expense</option>
		</select>
	</div>

	<Card>
		<CardContent>
			<AppDataTable
				{columns}
				data={filteredAccounts}
				emptyMessage="No accounts found"
				pageSize={20}
				totalItems={data.accounts.length}
				onRowClick={(row) => goto(`/financial/accounts/${row.id}`)}
			/>
		</CardContent>
	</Card>

	<div class="text-sm text-muted-foreground">
		Showing {filteredAccounts.length} of {data.accounts.length} accounts
	</div>
</div>
