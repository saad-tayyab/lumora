<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils/format';
	import { FileWarning } from '@lucide/svelte';

	interface OverdueItem {
		id: string;
		number: string;
		entity: string;
		amount: number;
		dueDate: string;
		daysOverdue: number;
	}

	interface Props {
		invoices: OverdueItem[];
		bills: OverdueItem[];
	}

	let { invoices, bills }: Props = $props();
	let allOverdue = $derived([...invoices, ...bills].sort((a, b) => b.daysOverdue - a.daysOverdue));
</script>

{#if allOverdue.length > 0}
	<Card.Root class="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-red-700 dark:text-red-400">
				<FileWarning class="h-5 w-5" />
				Overdue Items ({allOverdue.length})
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				{#each allOverdue.slice(0, 5) as item}
					<div class="flex items-center justify-between rounded-md border p-3">
						<div>
							<p class="text-sm font-medium">{item.number}</p>
							<p class="text-xs text-muted-foreground">{item.entity}</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium">{formatCurrency(item.amount)}</p>
							<p class="text-xs text-red-600 dark:text-red-400">
								{item.daysOverdue} days overdue
							</p>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
{/if}
