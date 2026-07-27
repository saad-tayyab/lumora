<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);

let filteredBills = $derived(
	data.bills.filter((b: { vendorId: string }) => !$form.vendorId || b.vendorId === $form.vendorId),
);
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ap/payments" class="hover:underline">Payments</a>
			<span>/</span>
			<span>New Payment</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Payment</h1>
	</div>

	<Card>
		<CardContent>
		<form method="POST" use:enhance class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="vendorId">Vendor *</Label>
				<select
					id="vendorId"
					bind:value={$form.vendorId}
					class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				>
					<option value="">Select vendor</option>
					{#each data.vendors as vendor}
						<option value={vendor.id}>{vendor.name}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-2">
				<Label for="billId">Bill (optional)</Label>
				<select
					id="billId"
					bind:value={$form.billId}
					class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				>
					<option value="">No bill (credit)</option>
					{#each filteredBills as bill}
						<option value={bill.id}>{bill.billNumber} - {bill.total}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-2">
				<Label for="amount">Amount *</Label>
				<Input
					id="amount"
					type="number"
					step="0.01"
					min="0.01"
					value={$form.amount}
					oninput={(e) => ($form.amount = Number(e.currentTarget.value))}
				/>
			</div>
			<div class="space-y-2">
				<Label for="paymentDate">Payment Date *</Label>
				<DatePicker bind:value={$form.paymentDate} />
			</div>
			<div class="space-y-2">
				<Label for="paymentMethod">Payment Method *</Label>
				<select
					id="paymentMethod"
					bind:value={$form.paymentMethod}
					class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				>
					<option value="bank_transfer">Bank Transfer</option>
					<option value="check">Check</option>
					<option value="cash">Cash</option>
					<option value="credit_card">Credit Card</option>
					<option value="online">Online</option>
				</select>
			</div>
			<div class="space-y-2">
				<Label for="reference">Reference</Label>
				<Input id="reference" bind:value={$form.reference} />
			</div>
			<div class="space-y-2">
				<Label for="bankAccountId">Bank Account</Label>
				<select
					id="bankAccountId"
					bind:value={$form.bankAccountId}
					class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				>
					<option value="">Select bank account</option>
					{#each data.bankAccounts as account}
						<option value={account.id}>{account.name} ({account.currency})</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes</Label>
			<Textarea id="notes" bind:value={$form.notes} rows={3} />
		</div>

		<div class="flex justify-end gap-3">
			<Button variant="outline" href="/ap/payments">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Recording...' : 'Record Payment'}
			</Button>
		</div>
	</form>
		</CardContent>
	</Card>
</div>
