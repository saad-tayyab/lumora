<script lang="ts">
import { toast } from 'svelte-sonner';
import { deleteCustomer, listCustomers } from '$lib/api/ar';
import type { Customer } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

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

const totalPages = $derived(Math.ceil(total / limit));
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Customers</h1>
			<p class="text-muted-foreground">Manage your customer accounts</p>
		</div>
		<a
			href="/ar/customers/new"
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			New Customer
		</a>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-sm text-muted-foreground">Loading customers...</div>
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{:else if customers.length === 0}
		<div class="rounded-lg border bg-card p-12 text-center shadow-sm">
			<p class="text-muted-foreground">No customers found.</p>
			<a href="/ar/customers/new" class="mt-4 inline-block text-sm text-primary hover:underline">
				Create your first customer
			</a>
		</div>
	{:else}
		<div class="rounded-lg border bg-card shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50 text-left">
						<th class="px-4 py-3 font-medium text-muted-foreground">Name</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Email</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Phone</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Payment Terms</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Credit Limit</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Status</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each customers as customer}
						<tr class="border-b last:border-b-0 hover:bg-muted/30">
							<td class="px-4 py-3">
								<a href="/ar/customers/{customer.id}" class="font-medium text-primary hover:underline">
									{customer.name}
								</a>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{customer.email || '—'}</td>
							<td class="px-4 py-3 text-muted-foreground">{customer.phone || '—'}</td>
							<td class="px-4 py-3 text-muted-foreground">{customer.paymentTerms}</td>
							<td class="px-4 py-3 text-muted-foreground">
								{customer.creditLimit ? formatCurrency(customer.creditLimit) : '—'}
							</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {customer.isActive
										? 'bg-green-100 text-green-800'
										: 'bg-gray-100 text-gray-800'}"
								>
									{customer.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<a href="/ar/customers/{customer.id}" class="text-primary hover:underline">View</a>
									<a href="/ar/customers/{customer.id}/edit" class="text-primary hover:underline">
										Edit
									</a>
									<button
										onclick={() => handleDelete(customer.id, customer.name)}
										class="text-destructive hover:underline"
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
				</p>
				<div class="flex items-center gap-2">
					<button
						onclick={() => (page = Math.max(0, page - 1))}
						disabled={page === 0}
						class="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
					>
						Previous
					</button>
					<span class="text-sm text-muted-foreground">
						Page {page + 1} of {totalPages}
					</span>
					<button
						onclick={() => (page = Math.min(totalPages - 1, page + 1))}
						disabled={page >= totalPages - 1}
						class="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
