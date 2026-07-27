<script lang="ts">
import type { Customer, Invoice, InvoiceLineItem } from '$lib/types';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
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
	<form method="POST">
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-3">
				<Field.Field>
					<Field.FieldLabel for="customerId">Customer *</Field.FieldLabel>
					<Select.Root bind:value={customerId}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select a customer" />
						</Select.Trigger>
						<Select.Content>
							{#each customers as customer}
								<Select.Item value={customer.id}>{customer.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.customerId}<p class="text-xs text-destructive">{errors.customerId[0]}</p>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="invoiceNumber">Invoice Number *</Field.FieldLabel>
					<Input id="invoiceNumber" name="invoiceNumber" type="text" required bind:value={invoiceNumber} placeholder="INV-001" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
					<Select.Root bind:value={currency}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select currency" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="USD">USD</Select.Item>
							<Select.Item value="EUR">EUR</Select.Item>
							<Select.Item value="GBP">GBP</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="issueDate">Issue Date *</Field.FieldLabel>
					<Input id="issueDate" name="issueDate" type="date" required bind:value={issueDate} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="dueDate">Due Date *</Field.FieldLabel>
					<Input id="dueDate" name="dueDate" type="date" required bind:value={dueDate} />
				</Field.Field>
			</div>

			<div>
				<h3 class="mb-3 text-sm font-medium text-card-foreground">Line Items</h3>
				<InvoiceLineItems {lineItems} onChange={(items) => (lineItems = items)} />
				<div class="mt-3 flex justify-end">
					<div class="text-sm font-medium text-card-foreground">Subtotal: ${subtotal.toFixed(2)}</div>
				</div>
			</div>

			<Field.Field>
				<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
				<Textarea id="notes" name="notes" rows="3" bind:value={notes} placeholder="Additional notes..." />
			</Field.Field>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}Saving...{:else}{invoice ? 'Update Invoice' : 'Create Invoice'}{/if}
				</Button>
				<Button variant="outline" href="/ar/invoices">Cancel</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
