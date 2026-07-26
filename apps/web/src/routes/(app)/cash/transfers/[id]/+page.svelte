<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/transfers" class="hover:underline">Transfers</a>
			<span>/</span>
			<span>{data.transfer?.id.slice(0, 8)}...</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Transfer Details</h1>
	</div>

	{#if data.transfer}
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Transfer Info</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd>
							<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusStyles[data.transfer.status] || statusStyles.pending}">
								{data.transfer.status}
							</span>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Amount</dt>
						<dd class="text-sm font-medium text-card-foreground">
							{formatCurrency(data.transfer.amount, data.transfer.currency)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Transfer Date</dt>
						<dd class="text-sm text-card-foreground">{formatDate(data.transfer.transferDate)}</dd>
					</div>
					{#if data.transfer.reference}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Reference</dt>
							<dd class="text-sm text-card-foreground">{data.transfer.reference}</dd>
						</div>
					{/if}
					{#if data.transfer.completedDate}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Completed</dt>
							<dd class="text-sm text-card-foreground">{formatDate(data.transfer.completedDate)}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Accounts</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">From Account</dt>
						<dd class="text-sm font-medium text-card-foreground">
							<a href="/cash/bank-accounts/{data.transfer.fromAccountId}" class="text-primary hover:underline">
								{data.transfer.fromAccountName || data.transfer.fromAccountId.slice(0, 8)}
							</a>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">To Account</dt>
						<dd class="text-sm font-medium text-card-foreground">
							<a href="/cash/bank-accounts/{data.transfer.toAccountId}" class="text-primary hover:underline">
								{data.transfer.toAccountName || data.transfer.toAccountId.slice(0, 8)}
							</a>
						</dd>
					</div>
				</dl>
				{#if data.transfer.notes}
					<div class="mt-4 border-t pt-4">
						<dt class="text-sm font-medium text-muted-foreground">Notes</dt>
						<dd class="mt-1 text-sm text-card-foreground">{data.transfer.notes}</dd>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Transfer not found</div>
		</div>
	{/if}
</div>
