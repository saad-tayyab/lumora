<script lang="ts">
let {
  role,
  errors = {},
}: { role?: { name: string; description: string | null }; errors?: Record<string, string[]> } =
  $props();

let name = $state(role?.name ?? '');
let description = $state(role?.description ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div>
			<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
			<input id="name" name="name" type="text" required maxlength="50" bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<input id="description" name="description" type="text" maxlength="255" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{role ? 'Update Role' : 'Create Role'}{/if}
			</button>
			<a href="/settings/roles" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
