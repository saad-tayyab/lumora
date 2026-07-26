<script lang="ts">
let {
  line,
  accounts,
  errors = {},
}: {
  line?: { glAccountId: string; description: string | null; budgetAmount: string };
  accounts: Array<{ id: string; code: string; name: string }>;
  errors?: Record<string, string[]>;
} = $props();

let glAccountId = $state(line?.glAccountId ?? '');
let description = $state(line?.description ?? '');
let budgetAmount = $state(line?.budgetAmount ?? '0');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="glAccountId" class="block text-sm font-medium text-card-foreground">GL Account *</label>
				<select id="glAccountId" name="glAccountId" required bind:value={glAccountId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select account</option>
					{#each accounts as account}
						<option value={account.id}>{account.code} - {account.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="budgetAmount" class="block text-sm font-medium text-card-foreground">Budget Amount *</label>
				<input id="budgetAmount" name="budgetAmount" type="number" step="0.01" min="0" required bind:value={budgetAmount} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{line ? 'Update Line' : 'Add Line'}{/if}
			</button>
			<a href="/budgets" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
