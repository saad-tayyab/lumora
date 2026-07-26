<script lang="ts">
import type { BudgetLine } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

let { lines }: { lines: BudgetLine[] } = $props();
</script>

<div class="rounded-lg border bg-card shadow-sm">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b bg-muted/50 text-left">
				<th class="px-4 py-3 font-medium text-muted-foreground">Account</th>
				<th class="px-4 py-3 font-medium text-muted-foreground">Description</th>
				<th class="px-4 py-3 font-medium text-muted-foreground text-right">Budget</th>
				<th class="px-4 py-3 font-medium text-muted-foreground text-right">Consumed</th>
				<th class="px-4 py-3 font-medium text-muted-foreground text-right">Variance</th>
			</tr>
		</thead>
		<tbody>
			{#each lines as line}
				{@const variance = parseFloat(line.budgetAmount) - parseFloat(line.consumedAmount)}
				<tr class="border-b last:border-b-0 hover:bg-muted/30">
					<td class="px-4 py-3 font-medium text-card-foreground">{line.glAccountId}</td>
					<td class="px-4 py-3 text-muted-foreground">{line.description || '—'}</td>
					<td class="px-4 py-3 text-right">{formatCurrency(line.budgetAmount)}</td>
					<td class="px-4 py-3 text-right">{formatCurrency(line.consumedAmount)}</td>
					<td class="px-4 py-3 text-right {variance < 0 ? 'text-destructive' : 'text-green-600'}">
						{formatCurrency(variance.toFixed(2))}
					</td>
				</tr>
			{/each}
			{#if lines.length === 0}
				<tr>
					<td colspan="5" class="px-4 py-12 text-center text-muted-foreground">No budget lines</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
