<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/budgets/consumptions" class="hover:underline">Budget Consumptions</a>
			<span>/</span>
			<span>{data.consumption?.id.slice(0, 8)}...</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Budget Consumption</h1>
	</div>

	{#if data.consumption}
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Consumption Details</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Budget Line</dt>
						<dd class="text-sm font-medium">
							<a href="/budgets" class="text-primary hover:underline">
								{data.consumption.budgetLineId.slice(0, 8)}...
							</a>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Amount</dt>
						<dd class="text-sm font-medium text-card-foreground">
							{formatCurrency(data.consumption.amount)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Consumption Date</dt>
						<dd class="text-sm text-card-foreground">{formatDate(data.consumption.consumptionDate)}</dd>
					</div>
					{#if data.consumption.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm text-card-foreground">{data.consumption.description}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Linked Journal Entry</h2>
				{#if data.consumption.journalEntryId}
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Journal Entry</dt>
							<dd class="text-sm font-medium">
								<a href="/financial/journal-entries/{data.consumption.journalEntryId}" class="text-primary hover:underline">
									{data.consumption.journalEntryId.slice(0, 8)}...
								</a>
							</dd>
						</div>
					</dl>
				{:else}
					<p class="text-sm text-muted-foreground">No linked journal entry</p>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Consumption not found</div>
		</div>
	{/if}
</div>
