<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  reconciled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/statements" class="hover:underline">Statements</a>
			<span>/</span>
			<span>{data.statement?.id.slice(0, 8)}...</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Statement Details</h1>
	</div>

	{#if data.statement}
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Statement Info</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Bank Account</dt>
						<dd class="text-sm font-medium text-card-foreground">
							<a href="/cash/bank-accounts/{data.statement.bankAccountId}" class="text-primary hover:underline">
								{data.statement.bankAccountName || data.statement.bankAccountId.slice(0, 8)}
							</a>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Statement Date</dt>
						<dd class="text-sm text-card-foreground">{formatDate(data.statement.statementDate)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd>
							<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusStyles[data.statement.status] || statusStyles.draft}">
								{data.statement.status}
							</span>
						</dd>
					</div>
				</dl>
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Balances</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Opening Balance</dt>
						<dd class="text-sm font-medium text-card-foreground">
							{formatCurrency(data.statement.openingBalance)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Closing Balance</dt>
						<dd class="text-sm font-medium text-card-foreground">
							{formatCurrency(data.statement.closingBalance)}
						</dd>
					</div>
					<div class="flex justify-between border-t pt-3">
						<dt class="text-sm font-medium text-card-foreground">Difference</dt>
						<dd class="text-sm font-bold text-card-foreground">
							{formatCurrency(
								parseFloat(data.statement.closingBalance) - parseFloat(data.statement.openingBalance)
							)}
						</dd>
					</div>
				</dl>
				{#if data.statement.notes}
					<div class="mt-4 border-t pt-4">
						<dt class="text-sm font-medium text-muted-foreground">Notes</dt>
						<dd class="mt-1 text-sm text-card-foreground">{data.statement.notes}</dd>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Statement not found</div>
		</div>
	{/if}
</div>
