<script lang="ts">
import { onMount } from 'svelte';
import { listCreditNotes } from '$lib/api/ar';
import type { CreditNote } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';

let creditNotes = $state<CreditNote[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let total = $state(0);
let page = $state(0);
let statusFilter = $state('');
const limit = 20;

async function load() {
  loading = true;
  error = null;
  try {
    const params: { limit: number; offset: number; status?: string } = {
      limit,
      offset: page * limit,
    };
    if (statusFilter) params.status = statusFilter;
    const res = await listCreditNotes(params);
    creditNotes = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load credit notes';
  } finally {
    loading = false;
  }
}

onMount(load);

$effect(() => {
  void statusFilter;
  page = 0;
  load();
});

const totalPages = $derived(Math.ceil(total / limit));

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  issued: 'bg-blue-100 text-blue-800',
  applied: 'bg-green-100 text-green-800',
  voided: 'bg-gray-100 text-gray-800',
};
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Credit Notes</h1>
			<p class="text-muted-foreground">Manage customer credit notes</p>
		</div>
		<a
			href="/ar/credit-notes/new"
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			Create Credit Note
		</a>
	</div>

	<div class="flex items-center gap-4">
		<label for="status" class="text-sm font-medium text-foreground">Status:</label>
		<select
			id="status"
			bind:value={statusFilter}
			class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
		>
			<option value="">All</option>
			<option value="draft">Draft</option>
			<option value="issued">Issued</option>
			<option value="applied">Applied</option>
			<option value="voided">Voided</option>
		</select>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-sm text-muted-foreground">Loading credit notes...</div>
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{:else if creditNotes.length === 0}
		<div class="rounded-lg border bg-card p-12 text-center shadow-sm">
			<p class="text-muted-foreground">No credit notes found.</p>
			<a href="/ar/credit-notes/new" class="mt-4 inline-block text-sm text-primary hover:underline">
				Create your first credit note
			</a>
		</div>
	{:else}
		<div class="rounded-lg border bg-card shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50 text-left">
						<th class="px-4 py-3 font-medium text-muted-foreground">Credit Note #</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Issue Date</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Reason</th>
						<th class="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
						<th class="px-4 py-3 font-medium text-muted-foreground text-right">Balance</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Status</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each creditNotes as cn}
						<tr class="border-b last:border-b-0 hover:bg-muted/30">
							<td class="px-4 py-3">
								<a href="/ar/credit-notes/{cn.id}" class="font-medium text-primary hover:underline">
									{cn.creditNoteNumber}
								</a>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(cn.issueDate)}</td>
							<td class="px-4 py-3 text-muted-foreground">{cn.reason}</td>
							<td class="px-4 py-3 text-right">{formatCurrency(cn.amount)}</td>
							<td class="px-4 py-3 text-right">{formatCurrency(cn.balance)}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusStyles[cn.status] ||
										statusStyles.draft}"
								>
									{cn.status}
								</span>
							</td>
							<td class="px-4 py-3">
								<a href="/ar/credit-notes/{cn.id}" class="text-primary hover:underline">View</a>
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
