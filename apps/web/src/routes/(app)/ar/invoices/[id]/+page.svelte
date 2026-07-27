<script lang="ts">
import { toast } from 'svelte-sonner';
import { updateInvoiceStatus } from '$lib/api/ar';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let invoice = $derived(data.invoice);
let lineItems = $derived(data.lineItems);
let customer = $derived(data.customer);
let updating = $state(false);

function statusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'overdue': return 'outline';
    case 'paid': return 'secondary';
    case 'sent': return 'default';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}

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

<div class="flex flex-col mx-auto max-w-4xl gap-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/ar/invoices" class="hover:underline">Invoices</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{invoice.invoiceNumber}</span>
	</nav>

	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">
				Invoice {invoice.invoiceNumber}
			</h1>
		</div>
		<div class="flex items-center gap-2">
		{#if invoice.status === 'draft'}
			<Button onclick={() => handleStatusChange('sent')} disabled={updating}>
				Mark as Sent
			</Button>
		{/if}
		{#if invoice.status === 'sent'}
			<Button onclick={() => handleStatusChange('paid')} disabled={updating} class="bg-green-600 hover:bg-green-700">
				Mark as Paid
			</Button>
		{/if}
		{#if invoice.status !== 'voided' && invoice.status !== 'paid'}
			<Button variant="destructive" onclick={() => handleStatusChange('voided')} disabled={updating}>
				Void
			</Button>
		{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="flex flex-col gap-6 lg:col-span-2">
			<Card.Root>
				<Card.Content>
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
			</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Line Items</Card.Title>
			</Card.Header>
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
			</Card.Content>
			</Card.Root>

			{#if invoice.notes}
				<Card.Root>
					<Card.Content>
						<h2 class="mb-2 text-lg font-semibold text-card-foreground">Notes</h2>
						<p class="text-sm text-muted-foreground">{invoice.notes}</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Summary</Card.Title>
			</Card.Header>
					<dl class="flex flex-col gap-3">
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
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Actions</Card.Title>
			</Card.Header>
					<div class="flex flex-col gap-2">
						<Button
							variant="outline"
							class="w-full"
							href="/ar/payments/new?invoiceId={invoice.id}&customerId={invoice.customerId}"
						>
							Record Payment
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
