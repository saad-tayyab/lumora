<script lang="ts">
let {
  rule,
  taxCodes,
  errors = {},
}: {
  rule?: {
    name: string;
    description: string | null;
    priority: number;
    taxCodeId: string;
    entityType: string;
    isActive: boolean;
  };
  taxCodes: Array<{ id: string; code: string; name: string }>;
  errors?: Record<string, string[]>;
} = $props();

let name = $state(rule?.name ?? '');
let description = $state(rule?.description ?? '');
let priority = $state(rule?.priority ?? 1);
let taxCodeId = $state(rule?.taxCodeId ?? '');
let entityType = $state(rule?.entityType ?? 'item');
let isActive = $state(rule?.isActive ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="priority" class="block text-sm font-medium text-card-foreground">Priority</label>
				<input id="priority" name="priority" type="number" min="1" bind:value={priority} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="taxCodeId" class="block text-sm font-medium text-card-foreground">Tax Code *</label>
				<select id="taxCodeId" name="taxCodeId" required bind:value={taxCodeId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select tax code</option>
					{#each taxCodes as tc}
						<option value={tc.id}>{tc.code} - {tc.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="entityType" class="block text-sm font-medium text-card-foreground">Entity Type</label>
				<select id="entityType" name="entityType" bind:value={entityType} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="item">Item</option>
					<option value="customer">Customer</option>
					<option value="vendor">Vendor</option>
					<option value="category">Category</option>
				</select>
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
				{#if isSubmitting}Saving...{:else}{rule ? 'Update Rule' : 'Create Rule'}{/if}
			</button>
			<a href="/tax/rules" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
