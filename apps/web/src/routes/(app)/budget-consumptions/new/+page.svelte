<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let budgetLineId = $state('');
let amount = $state('');
let consumptionDate = $state('');
let description = $state('');
let loading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/budgets/consumptions" class="hover:underline">Budget Consumptions</a>
			<span>/</span>
			<span>New Consumption</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Budget Consumption</h1>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
	>
		<div class="space-y-2">
			<label for="budgetLineId" class="text-sm font-medium text-card-foreground">Budget Line *</label>
			<select
				id="budgetLineId"
				name="budgetLineId"
				bind:value={budgetLineId}
				required
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
			>
				<option value="">Select a budget line</option>
				{#each data.budgetLines as line}
					<option value={line.id}>{line.budgetName} - {line.description || line.id.slice(0, 8)}</option>
				{/each}
			</select>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<label for="amount" class="text-sm font-medium text-card-foreground">Amount *</label>
				<input
					id="amount"
					name="amount"
					type="number"
					step="0.01"
					min="0.01"
					bind:value={amount}
					required
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					placeholder="0.00"
				/>
			</div>
			<div class="space-y-2">
				<label for="consumptionDate" class="text-sm font-medium text-card-foreground">Consumption Date *</label>
				<input
					id="consumptionDate"
					name="consumptionDate"
					type="date"
					bind:value={consumptionDate}
					required
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<label for="description" class="text-sm font-medium text-card-foreground">Description</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				bind:value={description}
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
				placeholder="Reason for consumption..."
			></textarea>
		</div>

		<div class="flex justify-end gap-3">
			<a
				href="/budgets/consumptions"
				class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={loading}
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Creating...' : 'Create Consumption'}
			</button>
		</div>
	</form>
</div>
