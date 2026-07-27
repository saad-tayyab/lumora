<script lang="ts">
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function varianceClass(amount: string): string {
  const num = parseFloat(amount);
  if (num > 0) return 'text-red-600 dark:text-red-400';
  if (num < 0) return 'text-green-600 dark:text-green-400';
  return 'text-muted-foreground';
}
</script>

<div class="flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/budgets" class="hover:underline">Budgets</a>
			<span>/</span>
			<a href="/budgets/{data.budgetId ?? ''}" class="hover:underline">Budget</a>
			<span>/</span>
			<span>Variance Report</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Variance Report</h1>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-card-foreground">Budget vs Actual</h2>
		{#if data.variance.length > 0}
			<div class="mt-4 overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">GL Account</th>
							<th class="px-4 py-3 text-right font-medium text-muted-foreground">Budget Amount</th>
							<th class="px-4 py-3 text-right font-medium text-muted-foreground">Consumed Amount</th>
							<th class="px-4 py-3 text-right font-medium text-muted-foreground">Variance Amount</th>
						</tr>
					</thead>
					<tbody>
						{#each data.variance as v}
							<tr class="border-b hover:bg-muted/30">
								<td class="px-4 py-3 font-mono text-xs">{v.glAccountId.slice(0, 8)}...</td>
								<td class="px-4 py-3 text-right">{formatCurrency(v.budgetAmount)}</td>
								<td class="px-4 py-3 text-right">{formatCurrency(v.consumedAmount)}</td>
								<td class="px-4 py-3 text-right font-medium">
									<span class={varianceClass(v.varianceAmount)}>
										{formatCurrency(v.varianceAmount)}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="mt-4 text-sm text-muted-foreground">No variance data available</p>
		{/if}
	</div>
</div>
