<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<a href="/ap/payments" class="hover:underline">Payments</a>
				<span>/</span>
				<span>{data.payment.id.slice(0, 8)}...</span>
			</div>
			<h1 class="mt-2 text-3xl font-bold text-foreground">Payment Details</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Payment Info</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Vendor</dt>
						<dd class="text-sm font-medium">{data.payment.vendorName || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Bill</dt>
						<dd class="text-sm font-medium">
							{#if data.payment.billNumber}
								<a href="/ap/bills/{data.payment.billId}" class="text-primary hover:underline">{data.payment.billNumber}</a>
							{:else}
								-
							{/if}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Payment Date</dt>
						<dd class="text-sm font-medium">{formatDate(data.payment.paymentDate)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Method</dt>
						<dd class="text-sm font-medium capitalize">{data.payment.paymentMethod.replace('_', ' ')}</dd>
					</div>
				</dl>
			</CardContent>
		</Card>

		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Amount</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Amount</dt>
						<dd class="text-lg font-bold">{formatCurrency(data.payment.amount)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Reference</dt>
						<dd class="text-sm font-medium">{data.payment.reference || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd class="text-sm font-medium">{formatDate(data.payment.createdAt)}</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	</div>

	{#if data.payment.notes}
		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Notes</h2>
				<p class="text-sm text-muted-foreground">{data.payment.notes}</p>
			</CardContent>
		</Card>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Payment</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete this payment? This action cannot be undone.
			</p>
			<div class="mt-4 flex justify-end gap-3">
				<Button variant="outline" onclick={() => (showDeleteConfirm = false)}>Cancel</Button>
				<form method="POST" action="?/delete" use:enhance={() => {
					deleting = true;
					return async ({ result }) => {
						deleting = false;
						if (result.type === 'success') {
							toast.success('Payment deleted');
							goto('/ap/payments');
						} else {
							toast.error('Failed to delete payment');
						}
						showDeleteConfirm = false;
					};
				}}>
					<Button type="submit" disabled={deleting} variant="destructive">
						{deleting ? 'Deleting...' : 'Delete'}
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}
