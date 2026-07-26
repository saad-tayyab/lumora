<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { formatCurrency } from '$lib/utils/format';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let customers = $derived(data.customers);
let isLoading = $state(false);

let lineItems = $state([
  { description: '', quantity: '1', unitPrice: '0', taxRate: '', sortOrder: 0 },
]);

const subtotal = $derived(
  lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0),
);

function addLineItem() {
  lineItems = [
    ...lineItems,
    { description: '', quantity: '1', unitPrice: '0', taxRate: '', sortOrder: lineItems.length },
  ];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
}

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Create Invoice</h1>
		<p class="text-muted-foreground">Create a new customer invoice</p>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<form
			method="POST"
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					await update();
				};
			}}
			class="space-y-6"
		>
			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<label for="customerId" class="block text-sm font-medium text-card-foreground">
						Customer *
					</label>
					<select
						id="customerId"
						name="customerId"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="">Select a customer</option>
						{#each customers as customer}
							<option value={customer.id}>{customer.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="invoiceNumber" class="block text-sm font-medium text-card-foreground">
						Invoice Number *
					</label>
					<input
						id="invoiceNumber"
						name="invoiceNumber"
						type="text"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="INV-001"
					/>
				</div>
				<div>
					<label for="currency" class="block text-sm font-medium text-card-foreground">
						Currency
					</label>
					<select
						id="currency"
						name="currency"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="USD" selected>USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</div>
				<div>
					<label for="issueDate" class="block text-sm font-medium text-card-foreground">
						Issue Date *
					</label>
					<input
						id="issueDate"
						name="issueDate"
						type="date"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="dueDate" class="block text-sm font-medium text-card-foreground">
						Due Date *
					</label>
					<input
						id="dueDate"
						name="dueDate"
						type="date"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
			</div>

			<div>
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-medium text-card-foreground">Line Items</h3>
					<button
						type="button"
						onclick={addLineItem}
						class="rounded-md border px-3 py-1 text-sm text-card-foreground hover:bg-accent"
					>
						Add Line
					</button>
				</div>

				<div class="space-y-3">
					{#each lineItems as item, index}
						<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
							<div>
								{#if index === 0}
									<label class="block text-xs font-medium text-muted-foreground">Description</label>
								{/if}
								<input
									type="text"
									name="lineDescription_{index}"
									bind:value={item.description}
									required
									placeholder="Item description"
									class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</div>
							<div>
								{#if index === 0}
									<label class="block text-xs font-medium text-muted-foreground">Quantity</label>
								{/if}
								<input
									type="number"
									name="lineQuantity_{index}"
									bind:value={item.quantity}
									step="0.01"
									min="0"
									class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</div>
							<div>
								{#if index === 0}
									<label class="block text-xs font-medium text-muted-foreground">Unit Price</label>
								{/if}
								<input
									type="number"
									name="lineUnitPrice_{index}"
									bind:value={item.unitPrice}
									step="0.01"
									min="0"
									class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</div>
							<div>
								{#if index === 0}
									<label class="block text-xs font-medium text-muted-foreground">Tax Rate</label>
								{/if}
								<input
									type="number"
									name="lineTaxRate_{index}"
									bind:value={item.taxRate}
									step="0.0001"
									min="0"
									placeholder="0.0000"
									class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</div>
							{#if lineItems.length > 1}
								<button
									type="button"
									onclick={() => removeLineItem(index)}
									class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10"
									aria-label="Remove line"
								>
									×
								</button>
							{:else}
								<div></div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-3 flex justify-end">
					<div class="text-sm font-medium text-card-foreground">
						Subtotal: {formatCurrency(subtotal)}
					</div>
				</div>
			</div>

			<div>
				<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
				<textarea
					id="notes"
					name="notes"
					rows="3"
					class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					placeholder="Additional notes..."
				></textarea>
			</div>

			<div class="flex items-center gap-3">
				<button
					type="submit"
					disabled={isLoading}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isLoading}
						Creating...
					{:else}
						Create Invoice
					{/if}
				</button>
				<a
					href="/ar/invoices"
					class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
