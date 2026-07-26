<script lang="ts">
import { toast } from 'svelte-sonner';
import { updateInvoiceStatus } from '$lib/api/ar';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let invoice = $derived(data.invoice);
let lineItems = $derived(data.lineItems);
let customer = $derived(data.customer);
let updating = $state(false);

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  voided: 'bg-gray-100 text-gray-800',
};

async function handleStatusChange(newStatus: string) {
  if (!confirm(`Change invoice status to "${newStatus}"?`)) return;
  updating = true;
  try {
    invoice = await updateInvoiceStatus(invoice.id, newStatus);
    toast.success(`Invoice status updated to ${newStatus}`);
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to update status');
  } finally {
    updating = false;
  }
}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<a href="/ar/invoices" class="hover:underline">Invoices</a>
				<span>/</span>
				<span>{invoice.invoiceNumber}</span>
			</div>
			<h1 class="mt-2 text-3xl font-bold text-foreground">
				Invoice {invoice.invoiceNumber}
			</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if invoice.status === 'draft'}
				<button
					onclick={() => handleStatusChange('sent')}
					disabled={updating}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					Mark as Sent
				</button>
			{/if}
			{#if invoice.status === 'sent'}
				<button
					onclick={() => handleStatusChange('paid')}
					disabled={updating}
					class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
				>
					Mark as Paid
				</button>
			{/if}
			{#if invoice.status !== 'voided' && invoice.status !== 'paid'}
				<button
					onclick={() => handleStatusChange('voided')}
					disabled={updating}
					class="rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
				>
					Void
				</button>
			{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-lg font-semibold text-card-foreground">Invoice Details</h2>
						{#if customer}
							<p class="mt-1 text-sm text-muted-foreground">
								<a href="/ar/customers/{customer.id}" class="text-primary hover:underline">
									{customer.name}
								</a>
							</p>
						{/if}
					</div>
					<span
						class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusStyles[invoice.status] ||
							statusStyles.draft}"
					>
						{invoice.status}
					</span>
				</div>

				<dl class="mt-4 grid gap-4 md:grid-cols-3">
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Issue Date</dt>
						<dd class="mt-1 text-sm text-card-foreground">{formatDate(invoice.issueDate)}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Due Date</dt>
						<dd class="mt-1 text-sm text-card-foreground">{formatDate(invoice.dueDate)}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Currency</dt>
						<dd class="mt-1 text-sm text-card-foreground">{invoice.currency}</dd>
					</div>
				</dl>
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Line Items</h2>
				{#if lineItems.length === 0}
					<p class="text-sm text-muted-foreground">No line items.</p>
				{:else}
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left">
								<th class="pb-2 font-medium text-muted-foreground">Description</th>
								<th class="pb-2 font-medium text-muted-foreground text-right">Qty</th>
								<th class="pb-2 font-medium text-muted-foreground text-right">Unit Price</th>
								<th class="pb-2 font-medium text-muted-foreground text-right">Amount</th>
							</tr>
						</thead>
						<tbody>
							{#each lineItems as item}
								<tr class="border-b last:border-b-0">
									<td class="py-2 text-card-foreground">{item.description}</td>
									<td class="py-2 text-right text-muted-foreground">{item.quantity}</td>
									<td class="py-2 text-right text-muted-foreground">
										{formatCurrency(item.unitPrice)}
									</td>
									<td class="py-2 text-right font-medium text-card-foreground">
										{formatCurrency(item.amount)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			{#if invoice.notes}
				<div class="rounded-lg border bg-card p-6 shadow-sm">
					<h2 class="mb-2 text-lg font-semibold text-card-foreground">Notes</h2>
					<p class="text-sm text-muted-foreground">{invoice.notes}</p>
				</div>
			{/if}
		</div>

		<div class="space-y-6">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Summary</h2>
				<dl class="space-y-3">
					<div class="flex items-center justify-between">
						<dt class="text-sm text-muted-foreground">Subtotal</dt>
						<dd class="text-sm text-card-foreground">{formatCurrency(invoice.subtotal)}</dd>
					</div>
					<div class="flex items-center justify-between">
						<dt class="text-sm text-muted-foreground">Tax</dt>
						<dd class="text-sm text-card-foreground">{formatCurrency(invoice.taxAmount)}</dd>
					</div>
					<div class="flex items-center justify-between border-t pt-3">
						<dt class="text-sm font-medium text-card-foreground">Total</dt>
						<dd class="text-sm font-medium text-card-foreground">
							{formatCurrency(invoice.totalAmount)}
						</dd>
					</div>
					<div class="flex items-center justify-between">
						<dt class="text-sm text-muted-foreground">Amount Paid</dt>
						<dd class="text-sm text-card-foreground">{formatCurrency(invoice.amountPaid)}</dd>
					</div>
					<div class="flex items-center justify-between border-t pt-3">
						<dt class="text-sm font-medium text-card-foreground">Balance Due</dt>
						<dd class="text-sm font-bold text-card-foreground">
							{formatCurrency(invoice.balanceDue)}
						</dd>
					</div>
				</dl>
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Actions</h2>
				<div class="space-y-2">
					<a
						href="/ar/payments/new?invoiceId={invoice.id}&customerId={invoice.customerId}"
						class="block w-full rounded-md border p-2 text-center text-sm font-medium text-card-foreground hover:bg-accent"
					>
						Record Payment
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
