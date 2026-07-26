<script lang="ts">
let {
  budget,
  errors = {},
}: {
  budget?: {
    name: string;
    description: string | null;
    periodStart: string;
    periodEnd: string;
    totalAmount: string;
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(budget?.name ?? '');
let description = $state(budget?.description ?? '');
let periodStart = $state(budget?.periodStart ?? '');
let periodEnd = $state(budget?.periodEnd ?? '');
let totalAmount = $state(budget?.totalAmount ?? '0');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div>
			<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
			<input id="name" name="name" type="text" required maxlength="100" bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="periodStart" class="block text-sm font-medium text-card-foreground">Period Start *</label>
				<input id="periodStart" name="periodStart" type="date" required bind:value={periodStart} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="periodEnd" class="block text-sm font-medium text-card-foreground">Period End *</label>
				<input id="periodEnd" name="periodEnd" type="date" required bind:value={periodEnd} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="totalAmount" class="block text-sm font-medium text-card-foreground">Total Amount</label>
				<input id="totalAmount" name="totalAmount" type="number" step="0.01" min="0" bind:value={totalAmount} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{budget ? 'Update Budget' : 'Create Budget'}{/if}
			</button>
			<a href="/budgets" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
