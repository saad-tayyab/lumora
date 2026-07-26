<script lang="ts">
let {
  item,
  errors = {},
}: {
  item?: {
    name: string;
    sku: string;
    description: string | null;
    categoryId: string;
    unitPrice: string;
    costPrice: string;
    reorderPoint: string;
    isActive: boolean;
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(item?.name ?? '');
let sku = $state(item?.sku ?? '');
let description = $state(item?.description ?? '');
let categoryId = $state(item?.categoryId ?? '');
let unitPrice = $state(item?.unitPrice ?? '0');
let costPrice = $state(item?.costPrice ?? '0');
let reorderPoint = $state(item?.reorderPoint ?? '0');
let isActive = $state(item?.isActive ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Item name" />
				{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
			</div>
			<div>
				<label for="sku" class="block text-sm font-medium text-card-foreground">SKU *</label>
				<input id="sku" name="sku" type="text" required bind:value={sku} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="SKU-001" />
			</div>
			<div>
				<label for="categoryId" class="block text-sm font-medium text-card-foreground">Category ID</label>
				<input id="categoryId" name="categoryId" type="text" bind:value={categoryId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="unitPrice" class="block text-sm font-medium text-card-foreground">Unit Price</label>
				<input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" bind:value={unitPrice} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="costPrice" class="block text-sm font-medium text-card-foreground">Cost Price</label>
				<input id="costPrice" name="costPrice" type="number" step="0.01" min="0" bind:value={costPrice} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="reorderPoint" class="block text-sm font-medium text-card-foreground">Reorder Point</label>
				<input id="reorderPoint" name="reorderPoint" type="number" min="0" bind:value={reorderPoint} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-2">
			<input id="isActive" name="isActive" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border-input" />
			<label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{item ? 'Update Item' : 'Create Item'}{/if}
			</button>
			<a href="/inv/items" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
