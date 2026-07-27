<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';
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

<div class="flex flex-col mx-auto max-w-2xl gap-6">
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
		<Card.Root>
			<Card.Content>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
							<Select.Root bind:value={vendorId}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select vendor" />
								</Select.Trigger>
								<Select.Content>
									{#each data.vendors as vendor}
										<Select.Item value={vendor.id}>{vendor.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="billId">Bill</Field.FieldLabel>
							<Select.Root bind:value={billId}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="No bill (credit)" />
								</Select.Trigger>
								<Select.Content>
									{#each filteredBills as bill}
										<Select.Item value={bill.id}>{bill.billNumber} - {bill.total}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
							<Input id="amount" name="amount" type="number" step="0.01" min="0.01" bind:value={amount} required />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="paymentDate">Payment Date *</Field.FieldLabel>
							<DatePicker bind:value={paymentDate} />
							<input type="hidden" name="paymentDate" value={paymentDate} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="paymentMethod">Payment Method *</Field.FieldLabel>
							<Select.Root bind:value={paymentMethod}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select method" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="bank_transfer">Bank Transfer</Select.Item>
									<Select.Item value="check">Check</Select.Item>
									<Select.Item value="cash">Cash</Select.Item>
									<Select.Item value="credit_card">Credit Card</Select.Item>
									<Select.Item value="online">Online</Select.Item>
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="reference">Reference</Field.FieldLabel>
							<Input id="reference" name="reference" bind:value={reference} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="bankAccountId">Bank Account</Field.FieldLabel>
							<Select.Root bind:value={bankAccountId}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select bank account" />
								</Select.Trigger>
								<Select.Content>
									{#each data.bankAccounts as account}
										<Select.Item value={account.id}>{account.name} ({account.currency})</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" name="notes" bind:value={notes} rows={3} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/ap/payments/{data.payment.id}">Cancel</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</Field.FieldGroup>
			</Card.Content>
		</Card.Root>
	</form>
</div>
