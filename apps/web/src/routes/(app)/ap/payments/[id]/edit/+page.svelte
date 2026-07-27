<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let loading = $state(false);

let vendorId = $state(data.payment.vendorId);
let billId = $state(data.payment.billId || '');
let amount = $state(data.payment.amount);
let paymentDate = $state(data.payment.paymentDate);
let paymentMethod = $state(data.payment.paymentMethod);
let reference = $state(data.payment.reference || '');
let bankAccountId = $state(data.payment.bankAccountId || '');
let notes = $state(data.payment.notes || '');

let filteredBills = $derived(
	data.bills.filter((b: { vendorId: string }) => !vendorId || b.vendorId === vendorId),
);
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ap/payments" class="hover:underline">Payments</a>
			<span>/</span>
			<a href="/ap/payments/{data.payment.id}" class="hover:underline">{data.payment.id.slice(0, 8)}...</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Payment</h1>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ result }) => {
				loading = false;
				if (result.type === 'success') {
					toast.success('Payment updated successfully');
					goto('/ap/payments/{data.payment.id}');
				} else if (result.type === 'failure') {
					toast.error((result.data as Record<string, string>)?.error || 'Failed to update payment');
				}
			};
		}}
	>
		<Card>
			<CardContent class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="vendorId">Vendor *</Label>
						<select id="vendorId" name="vendorId" bind:value={vendorId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select vendor</option>
							{#each data.vendors as vendor}
								<option value={vendor.id}>{vendor.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="billId">Bill</Label>
						<select id="billId" name="billId" bind:value={billId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">No bill (credit)</option>
							{#each filteredBills as bill}
								<option value={bill.id}>{bill.billNumber} - {bill.total}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="amount">Amount *</Label>
						<Input id="amount" name="amount" type="number" step="0.01" min="0.01" bind:value={amount} required />
					</div>
					<div class="space-y-2">
						<Label for="paymentDate">Payment Date *</Label>
						<DatePicker bind:value={paymentDate} />
						<input type="hidden" name="paymentDate" value={paymentDate} />
					</div>
					<div class="space-y-2">
						<Label for="paymentMethod">Payment Method *</Label>
						<select id="paymentMethod" name="paymentMethod" bind:value={paymentMethod} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="bank_transfer">Bank Transfer</option>
							<option value="check">Check</option>
							<option value="cash">Cash</option>
							<option value="credit_card">Credit Card</option>
							<option value="online">Online</option>
						</select>
					</div>
					<div class="space-y-2">
						<Label for="reference">Reference</Label>
						<Input id="reference" name="reference" bind:value={reference} />
					</div>
					<div class="space-y-2">
						<Label for="bankAccountId">Bank Account</Label>
						<select id="bankAccountId" name="bankAccountId" bind:value={bankAccountId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select bank account</option>
							{#each data.bankAccounts as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<Textarea id="notes" name="notes" bind:value={notes} rows={3} />
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/ap/payments/{data.payment.id}">Cancel</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>
</div>
