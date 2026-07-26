<script lang="ts">
import type { BudgetVariance } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

let { variances }: { variances: BudgetVariance[] } = $props();
</script>

<div class="space-y-4">
	{#each variances as v}
		{@const pct = parseFloat(v.budgetAmount) > 0 ? ((parseFloat(v.consumedAmount) / parseFloat(v.budgetAmount)) * 100) : 0}
		{@const remaining = parseFloat(v.budgetAmount) - parseFloat(v.consumedAmount)}
		<div class="rounded-lg border bg-card p-4 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium text-card-foreground">Account: {v.glAccountId}</span>
				<span class="text-sm text-muted-foreground">{pct.toFixed(1)}% consumed</span>
			</div>
			<div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
				<div class="h-full rounded-full {pct > 100 ? 'bg-destructive' : pct > 80 ? 'bg-yellow-500' : 'bg-primary'}" style="width: {Math.min(pct, 100)}%"></div>
			</div>
			<div class="flex justify-between text-xs text-muted-foreground">
				<span>Budget: {formatCurrency(v.budgetAmount)}</span>
				<span>Consumed: {formatCurrency(v.consumedAmount)}</span>
				<span class={remaining < 0 ? 'text-destructive' : ''}>Remaining: {formatCurrency(remaining.toFixed(2))}</span>
			</div>
		</div>
	{/each}
	{#if variances.length === 0}
		<div class="rounded-lg border bg-card p-12 text-center shadow-sm">
			<p class="text-muted-foreground">No budget variance data</p>
		</div>
	{/if}
</div>
