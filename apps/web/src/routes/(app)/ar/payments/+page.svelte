<script lang="ts">
import { listPayments } from '$lib/api/ar';
import type { Payment } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';

let payments = $state<Payment[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let total = $state(0);
let page = $state(0);
const limit = 20;

async function load() {
  loading = true;
  error = null;
  try {
    const res = await listPayments({ limit, offset: page * limit });
    payments = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load payments';
  } finally {
    loading = false;
  }
}

const totalPages = $derived(Math.ceil(total / limit));
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Payments</h1>
			<p class="text-muted-foreground">Customer payment history</p>
		</div>
		<a
			href="/ar/payments/new"
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			Record Payment
		</a>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-sm text-muted-foreground">Loading payments...</div>
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{:else if payments.length === 0}
		<div class="rounded-lg border bg-card p-12 text-center shadow-sm">
			<p class="text-muted-foreground">No payments found.</p>
			<a href="/ar/payments/new" class="mt-4 inline-block text-sm text-primary hover:underline">
				Record your first payment
			</a>
		</div>
	{:else}
		<div class="rounded-lg border bg-card shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50 text-left">
						<th class="px-4 py-3 font-medium text-muted-foreground">Payment #</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Date</th>
						<th class="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Method</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Reference</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each payments as payment}
						<tr class="border-b last:border-b-0 hover:bg-muted/30">
							<td class="px-4 py-3 font-medium text-card-foreground">{payment.paymentNumber}</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(payment.paymentDate)}</td>
							<td class="px-4 py-3 text-right font-medium text-card-foreground">
								{formatCurrency(payment.amount)}
							</td>
							<td class="px-4 py-3 text-muted-foreground">
								<span
									class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
								>
									{payment.paymentMethod.replace('_', ' ')}
								</span>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{payment.referenceNumber || '—'}</td>
							<td class="px-4 py-3">
								<a href="/ar/payments/{payment.id}" class="text-primary hover:underline">View</a>
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
