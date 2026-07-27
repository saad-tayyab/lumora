<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function statusVariant(status: string): 'secondary' | 'outline' {
  return status === 'reconciled' ? 'secondary' : 'outline';
}
</script>

<div class="mx-auto max-w-4xl flex flex-col gap-6">
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
			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Statement Info</Card.Title>
			</Card.Header>
					<dl class="flex flex-col gap-3">
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
							<Badge variant={statusVariant(data.statement.status)}>
								{data.statement.status}
							</Badge>
							</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Balances</Card.Title>
			</Card.Header>
					<dl class="flex flex-col gap-3">
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
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Statement not found</div>
		</div>
	{/if}
</div>
