<script lang="ts">
let {
  catalogItem,
  errors = {},
}: {
  catalogItem?: {
    vendorId: string;
    itemId: string;
    vendorPartNumber: string;
    unitPrice: string;
    leadTimeDays: string;
    minimumOrderQty: string;
  };
  errors?: Record<string, string[]>;
} = $props();

let vendorId = $state(catalogItem?.vendorId ?? '');
let itemId = $state(catalogItem?.itemId ?? '');
let vendorPartNumber = $state(catalogItem?.vendorPartNumber ?? '');
let unitPrice = $state(catalogItem?.unitPrice ?? '0');
let leadTimeDays = $state(catalogItem?.leadTimeDays ?? '0');
let minimumOrderQty = $state(catalogItem?.minimumOrderQty ?? '1');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="vendorId" class="block text-sm font-medium text-card-foreground">Vendor ID *</label>
				<input id="vendorId" name="vendorId" type="text" required bind:value={vendorId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors.vendorId}<p class="mt-1 text-xs text-destructive">{errors.vendorId[0]}</p>{/if}
			</div>
			<div>
				<label for="itemId" class="block text-sm font-medium text-card-foreground">Item ID *</label>
				<input id="itemId" name="itemId" type="text" required bind:value={itemId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="vendorPartNumber" class="block text-sm font-medium text-card-foreground">Vendor Part #</label>
				<input id="vendorPartNumber" name="vendorPartNumber" type="text" bind:value={vendorPartNumber} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="unitPrice" class="block text-sm font-medium text-card-foreground">Unit Price *</label>
				<input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required bind:value={unitPrice} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors.unitPrice}<p class="mt-1 text-xs text-destructive">{errors.unitPrice[0]}</p>{/if}
			</div>
			<div>
				<label for="leadTimeDays" class="block text-sm font-medium text-card-foreground">Lead Time (days)</label>
				<input id="leadTimeDays" name="leadTimeDays" type="number" min="0" bind:value={leadTimeDays} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="minimumOrderQty" class="block text-sm font-medium text-card-foreground">Min Order Qty</label>
				<input id="minimumOrderQty" name="minimumOrderQty" type="number" min="1" bind:value={minimumOrderQty} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{catalogItem ? 'Update' : 'Create'} Catalog Item{/if}
			</button>
			<a href="/proc/vendor-catalog" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
