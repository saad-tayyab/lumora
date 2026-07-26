<script lang="ts">
let {
  fiscalYear,
  errors = {},
}: {
  fiscalYear?: { name: string; startDate: string; endDate: string };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(fiscalYear?.name ?? '');
let startDate = $state(fiscalYear?.startDate ?? '');
let endDate = $state(fiscalYear?.endDate ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div>
			<label for="name" class="block text-sm font-medium text-card-foreground">Year Name *</label>
			<input id="name" name="name" type="text" required bind:value={name} placeholder="e.g. FY 2026" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="startDate" class="block text-sm font-medium text-card-foreground">Start Date *</label>
				<input id="startDate" name="startDate" type="date" required bind:value={startDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-card-foreground">End Date *</label>
				<input id="endDate" name="endDate" type="date" required bind:value={endDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{fiscalYear ? 'Update Fiscal Year' : 'Create Fiscal Year'}{/if}
			</button>
			<a href="/financial/fiscal-years" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
