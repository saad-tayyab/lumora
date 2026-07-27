<script lang="ts">
import * as Select from '$lib/components/ui/select';
let {
  vendors,
  items,
  errors = {},
}: {
  vendors: Array<{ id: string; name: string }>;
  items: Array<{ id: string; name: string; sku: string }>;
  errors?: Record<string, string[]>;
} = $props();

let vendorId = $state('');
let purchaseOrderId = $state('');
let receivedDate = $state('');
let notes = $state('');
let receivedItems = $state<Array<{ itemId: string; quantity: string; condition: string }>>([
  { itemId: '', quantity: '1', condition: 'good' },
]);

function addItem() {
  receivedItems = [...receivedItems, { itemId: '', quantity: '1', condition: 'good' }];
}

function removeItem(index: number) {
  receivedItems = receivedItems.filter((_, i) => i !== index);
}

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="flex flex-col gap-6">
		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="vendorId" class="block text-sm font-medium text-card-foreground">Vendor *</label>
			<Select.Root bind:value={vendorId}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select vendor" />
				</Select.Trigger>
				<Select.Content>
					{#each vendors as vendor}
						<Select.Item value={vendor.id}>{vendor.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			</div>
			<div>
				<label for="purchaseOrderId" class="block text-sm font-medium text-card-foreground">PO Reference</label>
				<input id="purchaseOrderId" name="purchaseOrderId" type="text" bind:value={purchaseOrderId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="PO number" />
			</div>
			<div>
				<label for="receivedDate" class="block text-sm font-medium text-card-foreground">Received Date *</label>
				<input id="receivedDate" name="receivedDate" type="date" required bind:value={receivedDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-card-foreground">Received Items</h3>
				<button type="button" onclick={addItem} class="rounded-md border px-3 py-1 text-sm text-card-foreground hover:bg-accent">+ Add Item</button>
			</div>
			<div class="flex flex-col gap-3">
				{#each receivedItems as _, index}
					<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Item *</label>{/if}
						<Select.Root>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select item" />
							</Select.Trigger>
							<Select.Content>
								{#each items as item}
									<Select.Item value={item.id}>{item.sku} - {item.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Quantity *</label>{/if}
							<input type="number" name="quantity_{index}" min="1" value={receivedItems[index].quantity} oninput={(e) => { receivedItems[index].quantity = (e.target as HTMLInputElement).value; receivedItems = [...receivedItems]; }} required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Condition</label>{/if}
						<Select.Root value={receivedItems[index].condition} onchange={(e: any) => { receivedItems[index].condition = e; receivedItems = [...receivedItems]; }}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select condition" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="good">Good</Select.Item>
								<Select.Item value="damaged">Damaged</Select.Item>
								<Select.Item value="partial">Partial</Select.Item>
							</Select.Content>
						</Select.Root>
						</div>
						{#if receivedItems.length > 1}
							<button type="button" onclick={() => removeItem(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10">×</button>
						{:else}
							<div></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="3" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Creating...{:else}Create Receiving Report{/if}
			</button>
			<a href="/proc/receiving-reports" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
