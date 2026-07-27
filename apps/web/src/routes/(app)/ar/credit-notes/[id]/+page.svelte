<script lang="ts">
import { toast } from 'svelte-sonner';
import { updateCreditNoteStatus } from '$lib/api/ar';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let cn = $derived(data.creditNote);
let customer = $derived(data.customer);
let updating = $state(false);

function cnStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'issued': return 'default';
    case 'applied': return 'secondary';
    case 'voided': return 'outline';
    default: return 'outline';
  }
}

async function handleStatusChange(newStatus: string) {
  if (!confirm(`Change credit note status to "${newStatus}"?`)) return;
  updating = true;
  try {
    cn = await updateCreditNoteStatus(cn.id, newStatus);
    toast.success(`Credit note status updated to ${newStatus}`);
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to update status');
  } finally {
    updating = false;
  }
}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<a href="/ar/credit-notes" class="hover:underline">Credit Notes</a>
				<span>/</span>
				<span>{cn.creditNoteNumber}</span>
			</div>
			<h1 class="mt-2 text-3xl font-bold text-foreground">
				Credit Note {cn.creditNoteNumber}
			</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if cn.status === 'draft'}
				<Button onclick={() => handleStatusChange('issued')} disabled={updating}>
					Mark as Issued
				</Button>
			{/if}
			{#if cn.status !== 'voided' && cn.status !== 'applied'}
				<Button variant="destructive" onclick={() => handleStatusChange('voided')} disabled={updating}>
					Void
				</Button>
			{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="lg:col-span-2 flex flex-col gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Credit Note Details</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-start justify-between">
						<div>
							{#if customer}
								<p class="mt-1 text-sm text-muted-foreground">
									<a href="/ar/customers/{customer.id}" class="text-primary hover:underline">
										{customer.name}
									</a>
								</p>
							{/if}
						</div>
					<Badge variant={cnStatusVariant(cn.status)}>
						{cn.status}
					</Badge>
					</div>

					<dl class="mt-4 grid gap-4 md:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Issue Date</dt>
							<dd class="mt-1 text-sm text-card-foreground">{formatDate(cn.issueDate)}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Currency</dt>
							<dd class="mt-1 text-sm text-card-foreground">{cn.currency}</dd>
						</div>
						<div class="md:col-span-2">
							<dt class="text-sm font-medium text-muted-foreground">Reason</dt>
							<dd class="mt-1 text-sm text-card-foreground">{cn.reason}</dd>
						</div>
					</dl>

					{#if cn.notes}
						<div class="mt-4 border-t pt-4">
							<dt class="text-sm font-medium text-muted-foreground">Notes</dt>
							<dd class="mt-1 text-sm text-card-foreground">{cn.notes}</dd>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Summary</Card.Title>
				</Card.Header>
				<Card.Content>
					<dl class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Amount</dt>
							<dd class="text-sm font-medium text-card-foreground">{formatCurrency(cn.amount)}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Applied</dt>
							<dd class="text-sm text-card-foreground">{formatCurrency(cn.amountApplied)}</dd>
						</div>
						<div class="flex items-center justify-between border-t pt-3">
							<dt class="text-sm font-medium text-card-foreground">Balance</dt>
							<dd class="text-sm font-bold text-card-foreground">
								{formatCurrency(cn.balance)}
							</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
