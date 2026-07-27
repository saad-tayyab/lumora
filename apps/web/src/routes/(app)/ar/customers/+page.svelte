<script lang="ts">
import { goto } from '$app/navigation';
import { toast } from 'svelte-sonner';
import { deleteCustomer, listCustomers } from '$lib/api/ar';
import type { Customer } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let customers = $state<Customer[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let total = $state(0);
let page = $state(0);
const limit = 20;

async function load() {
  loading = true;
  error = null;
  try {
    const res = await listCustomers({ limit, offset: page * limit });
    customers = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load customers';
  } finally {
    loading = false;
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Delete customer "${name}"?`)) return;
  try {
    await deleteCustomer(id);
    toast.success('Customer deleted');
    await load();
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete customer');
  }
}

$effect(() => {
  load();
});

function getStatusColor(isActive: boolean): string {
  return isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

const columns: ColumnDef<Customer, any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `<a href="/ar/customers/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.name}</a>`,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.email || '—'}</span>`,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.phone || '—'}</span>`,
  },
  {
    accessorKey: 'paymentTerms',
    header: 'Payment Terms',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.paymentTerms}</span>`,
  },
  {
    accessorKey: 'creditLimit',
    header: 'Credit Limit',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.creditLimit ? formatCurrency((row as any).original.creditLimit) : '—'}</span>`,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const label = (row as any).original.isActive ? 'Active' : 'Inactive';
      return `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.isActive)}">${label}</span>`;
    },
  },
];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Customers</h1>
			<p class="text-muted-foreground">Manage your customer accounts</p>
		</div>
		<Button href="/ar/customers/new">New Customer</Button>
	</div>

	{#if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<AppDataTable
		{columns}
		data={customers}
		{loading}
		emptyMessage="No customers found."
		pageSize={limit}
		totalItems={total}
		onRowClick={(row) => goto(`/ar/customers/${row.id}`)}
	/>
</div>
