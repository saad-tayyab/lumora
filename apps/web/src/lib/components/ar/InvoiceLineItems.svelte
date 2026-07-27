<script lang="ts">
import type { InvoiceLineItem } from '$lib/types';

let {
  lineItems,
  onChange,
}: { lineItems: InvoiceLineItem[]; onChange: (items: InvoiceLineItem[]) => void } = $props();

function addLine() {
  onChange([
    ...lineItems,
    {
      id: '',
      invoiceId: '',
      description: '',
      quantity: '1',
      unitPrice: '0',
      amount: '0',
      taxRate: null,
      taxAmount: null,
      sortOrder: lineItems.length,
      createdAt: '',
      updatedAt: '',
    },
  ]);
}

function removeLine(index: number) {
  onChange(lineItems.filter((_, i) => i !== index));
}

function updateLine(index: number, field: string, value: string) {
  const updated = [...lineItems];
  (updated[index] as unknown as Record<string, unknown>)[field] = value;
  const qty = parseFloat(updated[index].quantity) || 0;
  const price = parseFloat(updated[index].unitPrice) || 0;
  updated[index].amount = (qty * price).toFixed(2);
  onChange(updated);
}
</script>

<div class="flex flex-col gap-3">
	{#each lineItems as item, index}
		<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Description</label>{/if}
				<input type="text" value={item.description} oninput={(e) => updateLine(index, 'description', (e.target as HTMLInputElement).value)} required placeholder="Item description" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Quantity</label>{/if}
				<input type="number" value={item.quantity} oninput={(e) => updateLine(index, 'quantity', (e.target as HTMLInputElement).value)} step="0.01" min="0" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Unit Price</label>{/if}
				<input type="number" value={item.unitPrice} oninput={(e) => updateLine(index, 'unitPrice', (e.target as HTMLInputElement).value)} step="0.01" min="0" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			{#if lineItems.length > 1}
				<button type="button" onclick={() => removeLine(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10" aria-label="Remove line">×</button>
			{:else}
				<div></div>
			{/if}
		</div>
	{/each}
</div>

<button type="button" onclick={addLine} class="mt-2 text-sm text-primary hover:underline">+ Add Line</button>
