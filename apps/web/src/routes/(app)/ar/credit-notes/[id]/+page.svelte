<script lang="ts">
import { toast } from 'svelte-sonner';
import { updateCreditNoteStatus } from '$lib/api/ar';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let cn = $derived(data.creditNote);
let customer = $derived(data.customer);
let updating = $state(false);

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  issued: 'bg-blue-100 text-blue-800',
  applied: 'bg-green-100 text-green-800',
  voided: 'bg-gray-100 text-gray-800',
};

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

<div class="space-y-6">
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
				<button
					onclick={() => handleStatusChange('issued')}
					disabled={updating}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					Mark as Issued
				</button>
			{/if}
			{#if cn.status !== 'voided' && cn.status !== 'applied'}
				<button
					onclick={() => handleStatusChange('voided')}
					disabled={updating}
					class="rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
				>
					Void
				</button>
			{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="lg:col-span-2 space-y-6">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-lg font-semibold text-card-foreground">Credit Note Details</h2>
						{#if customer}
							<p class="mt-1 text-sm text-muted-foreground">
								<a href="/ar/customers/{customer.id}" class="text-primary hover:underline">
									{customer.name}
								</a>
							</p>
						{/if}
					</div>
					<span
						class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusStyles[cn.status] ||
							statusStyles.draft}"
					>
						{cn.status}
					</span>
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
			</div>
		</div>

		<div class="space-y-6">
			<div class="rounded-lg border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Summary</h2>
				<dl class="space-y-3">
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
			</div>
		</div>
	</div>
</div>
