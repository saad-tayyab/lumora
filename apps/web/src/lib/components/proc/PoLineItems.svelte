<script lang="ts">
interface PoLineItem {
  itemId: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

let { lineItems, onChange }: { lineItems: PoLineItem[]; onChange: (items: PoLineItem[]) => void } =
  $props();

function addLine() {
  onChange([...lineItems, { itemId: '', description: '', quantity: '1', unitPrice: '0' }]);
}

function removeLine(index: number) {
  onChange(lineItems.filter((_, i) => i !== index));
}

function updateLine(index: number, field: string, value: string) {
  const updated = [...lineItems];
  (updated[index] as unknown as Record<string, string>)[field] = value;
  onChange(updated);
}
</script>

<div class="space-y-3">
	{#each lineItems as item, index}
		<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1fr_2fr_1fr_1fr_auto]">
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Item ID *</label>{/if}
				<input type="text" value={item.itemId} oninput={(e) => updateLine(index, 'itemId', (e.target as HTMLInputElement).value)} required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Item ID" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Description</label>{/if}
				<input type="text" value={item.description} oninput={(e) => updateLine(index, 'description', (e.target as HTMLInputElement).value)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Description" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Quantity *</label>{/if}
				<input type="number" value={item.quantity} oninput={(e) => updateLine(index, 'quantity', (e.target as HTMLInputElement).value)} min="0" step="1" required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Unit Price *</label>{/if}
				<input type="number" value={item.unitPrice} oninput={(e) => updateLine(index, 'unitPrice', (e.target as HTMLInputElement).value)} min="0" step="0.01" required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			{#if lineItems.length > 1}
				<button type="button" onclick={() => removeLine(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10">×</button>
			{:else}
				<div></div>
			{/if}
		</div>
	{/each}
</div>

<button type="button" onclick={addLine} class="mt-2 text-sm text-primary hover:underline">+ Add Line</button>
