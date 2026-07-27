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
let customers = $derived(data.customers);
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Create Credit Note</h1>
		<p class="text-muted-foreground">Issue a credit note to a customer</p>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="customerId">Customer *</Field.FieldLabel>
						<Select.Root bind:value={$form.customerId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select a customer" />
							</Select.Trigger>
							<Select.Content>
								{#each customers as customer}
									<Select.Item value={customer.id}>{customer.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="creditNoteNumber">Credit Note Number *</Field.FieldLabel>
						<Input id="creditNoteNumber" bind:value={$form.creditNoteNumber} placeholder="CN-001" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="issueDate">Issue Date *</Field.FieldLabel>
						<DatePicker bind:value={$form.issueDate} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
						<Input
							id="amount"
							type="number"
							step="0.01"
							min="0"
							value={$form.amount}
							oninput={(e) => ($form.amount = Number(e.currentTarget.value))}
							placeholder="0.00"
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
						<Select.Root bind:value={$form.currency}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select currency" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="USD">USD</Select.Item>
								<Select.Item value="EUR">EUR</Select.Item>
								<Select.Item value="GBP">GBP</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel for="reason">Reason *</Field.FieldLabel>
					<Input id="reason" bind:value={$form.reason} maxlength={500} placeholder="Reason for credit note" />
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
					<Textarea id="notes" bind:value={$form.notes} rows={3} placeholder="Additional notes..." />
				</Field.Field>

				<div class="flex items-center gap-3">
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Credit Note'}
					</Button>
					<Button variant="outline" href="/ar/credit-notes">Cancel</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
