<script lang="ts">
let {
  policy,
  errors = {},
}: {
  policy?: {
    name: string;
    type: string;
    value: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(policy?.name ?? '');
let type = $state(policy?.type ?? 'percentage');
let value = $state(policy?.value ?? '0');
let startDate = $state(policy?.startDate ?? '');
let endDate = $state(policy?.endDate ?? '');
let isActive = $state(policy?.isActive ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Policy name" />
			</div>
			<div>
				<label for="type" class="block text-sm font-medium text-card-foreground">Type *</label>
				<select id="type" name="type" bind:value={type} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="percentage">Percentage</option>
					<option value="fixed_amount">Fixed Amount</option>
					<option value="tiered">Tiered</option>
				</select>
			</div>
			<div>
				<label for="value" class="block text-sm font-medium text-card-foreground">Value *</label>
				<input id="value" name="value" type="number" step="0.01" min="0" required bind:value={value} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="startDate" class="block text-sm font-medium text-card-foreground">Start Date *</label>
				<input id="startDate" name="startDate" type="date" required bind:value={startDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-card-foreground">End Date</label>
				<input id="endDate" name="endDate" type="date" bind:value={endDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-2">
			<input id="isActive" name="isActive" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border-input" />
			<label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{policy ? 'Update Policy' : 'Create Policy'}{/if}
			</button>
			<a href="/sales/discount-policies" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
