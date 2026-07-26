<script lang="ts">
let {
  warehouses,
  items,
  errors = {},
}: {
  warehouses: Array<{ id: string; name: string }>;
  items: Array<{ id: string; name: string; sku: string }>;
  errors?: Record<string, string[]>;
} = $props();

let itemId = $state('');
let fromWarehouseId = $state('');
let toWarehouseId = $state('');
let quantity = $state('1');
let movementType = $state('transfer');
let referenceNumber = $state('');
let notes = $state('');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="itemId" class="block text-sm font-medium text-card-foreground">Item *</label>
				<select id="itemId" name="itemId" required bind:value={itemId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select item</option>
					{#each items as item}
						<option value={item.id}>{item.sku} - {item.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="movementType" class="block text-sm font-medium text-card-foreground">Type *</label>
				<select id="movementType" name="movementType" required bind:value={movementType} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="transfer">Transfer</option>
					<option value="receipt">Receipt</option>
					<option value="issue">Issue</option>
					<option value="adjustment">Adjustment</option>
				</select>
			</div>
			<div>
				<label for="fromWarehouseId" class="block text-sm font-medium text-card-foreground">From Warehouse</label>
				<select id="fromWarehouseId" name="fromWarehouseId" bind:value={fromWarehouseId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select warehouse</option>
					{#each warehouses as wh}
						<option value={wh.id}>{wh.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="toWarehouseId" class="block text-sm font-medium text-card-foreground">To Warehouse</label>
				<select id="toWarehouseId" name="toWarehouseId" bind:value={toWarehouseId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select warehouse</option>
					{#each warehouses as wh}
						<option value={wh.id}>{wh.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="quantity" class="block text-sm font-medium text-card-foreground">Quantity *</label>
				<input id="quantity" name="quantity" type="number" min="1" required bind:value={quantity} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="referenceNumber" class="block text-sm font-medium text-card-foreground">Reference #</label>
				<input id="referenceNumber" name="referenceNumber" type="text" bind:value={referenceNumber} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="3" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Recording...{:else}Record Movement{/if}
			</button>
			<a href="/inv/stock-movements" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
