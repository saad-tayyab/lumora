<script lang="ts">
let {
  warehouse,
  errors = {},
}: {
  warehouse?: {
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    country: string | null;
    status?: 'active' | 'inactive';
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(warehouse?.name ?? '');
let code = $state(warehouse?.code ?? '');
let address = $state(warehouse?.address ?? '');
let city = $state(warehouse?.city ?? '');
let country = $state(warehouse?.country ?? '');
let isActive = $state(warehouse?.status !== 'inactive');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Warehouse name" />
				{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
			</div>
			<div>
				<label for="code" class="block text-sm font-medium text-card-foreground">Code *</label>
				<input id="code" name="code" type="text" required maxlength="20" bind:value={code} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="WH-01" />
				{#if errors.code}<p class="mt-1 text-xs text-destructive">{errors.code[0]}</p>{/if}
			</div>
		</div>

		<div>
			<label for="address" class="block text-sm font-medium text-card-foreground">Address</label>
			<input id="address" name="address" type="text" bind:value={address} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="city" class="block text-sm font-medium text-card-foreground">City</label>
				<input id="city" name="city" type="text" bind:value={city} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="country" class="block text-sm font-medium text-card-foreground">Country</label>
				<input id="country" name="country" type="text" maxlength="3" bind:value={country} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="USA" />
			</div>
		</div>

		<div class="flex items-center gap-2">
			<input id="isActive" name="isActive" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border-input" />
			<label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{warehouse ? 'Update Warehouse' : 'Create Warehouse'}{/if}
			</button>
			<a href="/inv/warehouses" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
