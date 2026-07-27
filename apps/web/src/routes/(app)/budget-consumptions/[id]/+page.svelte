<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
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
			<Card.Root class="shadow-sm"><Card.Content>
				<Card.Header>
				<Card.Title>Consumption Details</Card.Title>
			</Card.Header>
				<dl class="flex flex-col gap-3">
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
			</Card.Content></Card.Root>

			<Card.Root class="shadow-sm"><Card.Content>
				<Card.Header>
				<Card.Title>Linked Journal Entry</Card.Title>
			</Card.Header>
				{#if data.consumption.journalEntryId}
					<dl class="flex flex-col gap-3">
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
			</Card.Content></Card.Root>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Consumption not found</div>
		</div>
	{/if}
</div>
