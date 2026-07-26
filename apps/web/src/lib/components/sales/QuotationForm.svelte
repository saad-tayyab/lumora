<script lang="ts">
let {
  customers,
  quotation,
  errors = {},
}: {
  customers: Array<{ id: string; name: string }>;
  quotation?: { customerId: string; validUntil: string | null; notes: string | null };
  errors?: Record<string, string[]>;
} = $props();

let customerId = $state(quotation?.customerId ?? '');
let validUntil = $state(quotation?.validUntil ?? '');
let notes = $state(quotation?.notes ?? '');
let lineItems = $state<
  Array<{
    itemId: string;
    description: string;
    quantity: string;
    unitPrice: string;
    discount: string;
  }>
>([{ itemId: '', description: '', quantity: '1', unitPrice: '0', discount: '0' }]);

function addLineItem() {
  lineItems = [
    ...lineItems,
    { itemId: '', description: '', quantity: '1', unitPrice: '0', discount: '0' },
  ];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
}

function updateLineItem(index: number, field: string, value: string) {
  const updated = [...lineItems];
  (updated[index] as Record<string, string>)[field] = value;
  lineItems = updated;
}

const subtotal = $derived(
  lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const disc = parseFloat(item.discount) || 0;
    return sum + qty * price - disc;
  }, 0),
);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="customerId" class="block text-sm font-medium text-card-foreground">Customer *</label>
				<select id="customerId" name="customerId" required bind:value={customerId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select customer</option>
					{#each customers as customer}
						<option value={customer.id}>{customer.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="validUntil" class="block text-sm font-medium text-card-foreground">Valid Until</label>
				<input id="validUntil" name="validUntil" type="date" bind:value={validUntil} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-card-foreground">Line Items</h3>
				<button type="button" onclick={addLineItem} class="rounded-md border px-3 py-1 text-sm text-card-foreground hover:bg-accent">+ Add Line</button>
			</div>
			<div class="space-y-3">
				{#each lineItems as item, index}
					<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto]">
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Item ID</label>{/if}
							<input type="text" value={item.itemId} oninput={(e) => updateLineItem(index, 'itemId', (e.target as HTMLInputElement).value)} required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Description</label>{/if}
							<input type="text" value={item.description} oninput={(e) => updateLineItem(index, 'description', (e.target as HTMLInputElement).value)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Qty</label>{/if}
							<input type="number" value={item.quantity} oninput={(e) => updateLineItem(index, 'quantity', (e.target as HTMLInputElement).value)} min="0" step="1" required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Unit Price</label>{/if}
							<input type="number" value={item.unitPrice} oninput={(e) => updateLineItem(index, 'unitPrice', (e.target as HTMLInputElement).value)} min="0" step="0.01" required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Discount</label>{/if}
							<input type="number" value={item.discount} oninput={(e) => updateLineItem(index, 'discount', (e.target as HTMLInputElement).value)} min="0" step="0.01" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						{#if lineItems.length > 1}
							<button type="button" onclick={() => removeLineItem(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10">×</button>
						{:else}
							<div></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-3 flex justify-end">
				<div class="text-sm font-medium text-card-foreground">Subtotal: ${subtotal.toFixed(2)}</div>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="3" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Creating...{:else}Create Quotation{/if}
			</button>
			<a href="/sales/quotations" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
