<script lang="ts">
let {
  category,
  errors = {},
}: {
  category?: { name: string; code: string; description: string | null; isActive: boolean };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(category?.name ?? '');
let code = $state(category?.code ?? '');
let description = $state(category?.description ?? '');
let isActive = $state(category?.isActive ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Category name" />
				{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
			</div>
			<div>
				<label for="code" class="block text-sm font-medium text-card-foreground">Code *</label>
				<input id="code" name="code" type="text" required maxlength="20" bind:value={code} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. RAW" />
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
				{#if isSubmitting}Saving...{:else}{category ? 'Update Category' : 'Create Category'}{/if}
			</button>
			<a href="/inv/categories" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
