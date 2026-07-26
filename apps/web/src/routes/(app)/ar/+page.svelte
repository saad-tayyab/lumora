<script lang="ts">
import { onMount } from 'svelte';
import { listCustomers, listInvoices, listPayments } from '$lib/api/ar';
import type { Customer, Invoice, Payment } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

let customers = $state<Customer[]>([]);
let invoices = $state<Invoice[]>([]);
let payments = $state<Payment[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);

const totalOutstanding = $derived(
  invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'voided')
    .reduce((sum, i) => sum + parseFloat(i.balanceDue || '0'), 0),
);

const overdueCount = $derived(invoices.filter((i) => i.status === 'overdue').length);

const recentPayments = $derived(payments.slice(0, 5));

onMount(async () => {
  try {
    const [custRes, invRes, payRes] = await Promise.all([
      listCustomers({ limit: 5 }),
      listInvoices({ limit: 10 }),
      listPayments({ limit: 5 }),
    ]);
    customers = custRes.data;
    invoices = invRes.data;
    payments = payRes.data;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load dashboard';
  } finally {
    loading = false;
  }
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Accounts Receivable</h1>
		<p class="text-muted-foreground">Manage customers, invoices, payments, and credit notes</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-sm text-muted-foreground">Loading...</div>
		</div>
	{:else if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="text-sm font-medium text-muted-foreground">Total Customers</div>
				<div class="mt-2 text-3xl font-bold text-card-foreground">{customers.length}</div>
			</div>
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="text-sm font-medium text-muted-foreground">Outstanding Balance</div>
				<div class="mt-2 text-3xl font-bold text-card-foreground">
					{formatCurrency(totalOutstanding)}
				</div>
			</div>
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="text-sm font-medium text-muted-foreground">Overdue Invoices</div>
				<div class="mt-2 text-3xl font-bold text-card-foreground">{overdueCount}</div>
			</div>
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="text-sm font-medium text-muted-foreground">Recent Payments</div>
				<div class="mt-2 text-3xl font-bold text-card-foreground">{payments.length}</div>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Recent Invoices</h2>
					<a href="/ar/invoices" class="text-sm text-primary hover:underline">View all</a>
				</div>
				{#if invoices.length === 0}
					<p class="text-sm text-muted-foreground">No invoices yet.</p>
				{:else}
					<div class="space-y-3">
						{#each invoices.slice(0, 5) as invoice}
							<a
								href="/ar/invoices/{invoice.id}"
								class="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
							>
								<div>
									<div class="text-sm font-medium text-card-foreground">
										{invoice.invoiceNumber}
									</div>
									<div class="text-xs text-muted-foreground">{invoice.issueDate}</div>
								</div>
								<div class="text-right">
									<div class="text-sm font-medium text-card-foreground">
										{formatCurrency(invoice.totalAmount)}
									</div>
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
											{invoice.status === 'draft'
												? 'bg-gray-100 text-gray-800'
												: invoice.status === 'sent'
													? 'bg-blue-100 text-blue-800'
													: invoice.status === 'paid'
														? 'bg-green-100 text-green-800'
														: invoice.status === 'overdue'
															? 'bg-red-100 text-red-800'
															: 'bg-gray-100 text-gray-800'}"
									>
										{invoice.status}
									</span>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Recent Payments</h2>
					<a href="/ar/payments" class="text-sm text-primary hover:underline">View all</a>
				</div>
				{#if recentPayments.length === 0}
					<p class="text-sm text-muted-foreground">No payments yet.</p>
				{:else}
					<div class="space-y-3">
						{#each recentPayments as payment}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<div class="text-sm font-medium text-card-foreground">
										{payment.paymentNumber}
									</div>
									<div class="text-xs text-muted-foreground">{payment.paymentDate}</div>
								</div>
								<div class="text-sm font-medium text-card-foreground">
									{formatCurrency(payment.amount)}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<a
					href="/ar/customers/new"
					class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					New Customer
				</a>
				<a
					href="/ar/invoices/new"
					class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Create Invoice
				</a>
				<a
					href="/ar/payments/new"
					class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Record Payment
				</a>
				<a
					href="/ar/credit-notes/new"
					class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Create Credit Note
				</a>
			</div>
		</div>
	{/if}
</div>
