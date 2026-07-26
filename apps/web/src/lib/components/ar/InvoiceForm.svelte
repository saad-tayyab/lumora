<script lang="ts">
import type { Customer, Invoice, InvoiceLineItem } from '$lib/types';
import InvoiceLineItems from './InvoiceLineItems.svelte';

let {
  invoice,
  customers,
  errors = {},
}: { invoice?: Invoice; customers: Customer[]; errors?: Record<string, string[]> } = $props();

let customerId = $state(invoice?.customerId ?? '');
let invoiceNumber = $state(invoice?.invoiceNumber ?? '');
let issueDate = $state(invoice?.issueDate ?? '');
let dueDate = $state(invoice?.dueDate ?? '');
let currency = $state(invoice?.currency ?? 'USD');
let notes = $state(invoice?.notes ?? '');

let lineItems = $state<InvoiceLineItem[]>(
  invoice
    ? []
    : [
        {
          id: '',
          invoiceId: '',
          description: '',
          quantity: '1',
          unitPrice: '0',
          amount: '0',
          taxRate: null,
          taxAmount: null,
          sortOrder: 0,
          createdAt: '',
          updatedAt: '',
        },
      ],
);

const subtotal = $derived(
  lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0),
);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="customerId" class="block text-sm font-medium text-card-foreground">Customer *</label>
				<select id="customerId" name="customerId" required bind:value={customerId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select a customer</option>
					{#each customers as customer}
						<option value={customer.id}>{customer.name}</option>
					{/each}
				</select>
				{#if errors.customerId}<p class="mt-1 text-xs text-destructive">{errors.customerId[0]}</p>{/if}
			</div>
			<div>
				<label for="invoiceNumber" class="block text-sm font-medium text-card-foreground">Invoice Number *</label>
				<input id="invoiceNumber" name="invoiceNumber" type="text" required bind:value={invoiceNumber} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="INV-001" />
			</div>
			<div>
				<label for="currency" class="block text-sm font-medium text-card-foreground">Currency</label>
				<select id="currency" name="currency" bind:value={currency} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="USD">USD</option>
					<option value="EUR">EUR</option>
					<option value="GBP">GBP</option>
				</select>
			</div>
			<div>
				<label for="issueDate" class="block text-sm font-medium text-card-foreground">Issue Date *</label>
				<input id="issueDate" name="issueDate" type="date" required bind:value={issueDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-card-foreground">Due Date *</label>
				<input id="dueDate" name="dueDate" type="date" required bind:value={dueDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<h3 class="mb-3 text-sm font-medium text-card-foreground">Line Items</h3>
			<InvoiceLineItems {lineItems} onChange={(items) => (lineItems = items)} />
			<div class="mt-3 flex justify-end">
				<div class="text-sm font-medium text-card-foreground">Subtotal: ${subtotal.toFixed(2)}</div>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="3" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Additional notes..."></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{invoice ? 'Update Invoice' : 'Create Invoice'}{/if}
			</button>
			<a href="/ar/invoices" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
