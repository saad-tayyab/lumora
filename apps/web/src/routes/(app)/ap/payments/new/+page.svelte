<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);

let filteredBills = $derived(
	data.bills.filter((b: { vendorId: string }) => !$form.vendorId || b.vendorId === $form.vendorId),
);
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ap/payments" class="hover:underline">Payments</a>
			<span>/</span>
			<span>New Payment</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Payment</h1>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
						<Select.Root bind:value={$form.vendorId}>
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
						<Field.FieldLabel for="billId">Bill (optional)</Field.FieldLabel>
						<Select.Root bind:value={$form.billId}>
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
						<Input
							id="amount"
							type="number"
							step="0.01"
							min="0.01"
							value={$form.amount}
							oninput={(e) => ($form.amount = Number(e.currentTarget.value))}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="paymentDate">Payment Date *</Field.FieldLabel>
						<DatePicker bind:value={$form.paymentDate} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="paymentMethod">Payment Method *</Field.FieldLabel>
						<Select.Root bind:value={$form.paymentMethod}>
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
						<Input id="reference" bind:value={$form.reference} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="bankAccountId">Bank Account</Field.FieldLabel>
						<Select.Root bind:value={$form.bankAccountId}>
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
					<Textarea id="notes" bind:value={$form.notes} rows={3} />
				</Field.Field>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/ap/payments">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Recording...' : 'Record Payment'}
					</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
