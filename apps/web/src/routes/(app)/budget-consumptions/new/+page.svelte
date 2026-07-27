<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData, PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

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

<div class="flex flex-col mx-auto max-w-2xl gap-6">
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
		class="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm"
	>
		<div class="flex flex-col gap-2">
			<label for="budgetLineId" class="text-sm font-medium text-card-foreground">Budget Line *</label>
			<Select.Root bind:value={budgetLineId}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select a budget line" />
				</Select.Trigger>
				<Select.Content>
					{#each data.budgetLines as line}
						<Select.Item value={line.id}>{line.budgetName} - {line.description || line.id.slice(0, 8)}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-2">
				<label for="amount" class="text-sm font-medium text-card-foreground">Amount *</label>
				<Input id="amount" name="amount" type="number" bind:value={amount}
					placeholder="0.00"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="consumptionDate" class="text-sm font-medium text-card-foreground">Consumption Date *</label>
				<DatePicker bind:value={consumptionDate} />
				<input type="hidden" name="consumptionDate" value={consumptionDate} />
			</div>
		</div>

		<div class="flex flex-col gap-2">
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
