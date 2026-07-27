<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Vendor</h1>
		<p class="text-muted-foreground">Create a new vendor record</p>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="name">Name *</Field.FieldLabel>
						<Input id="name" bind:value={$form.name} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="email">Email</Field.FieldLabel>
						<Input id="email" type="email" bind:value={$form.email} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="phone">Phone</Field.FieldLabel>
						<Input id="phone" bind:value={$form.phone} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="taxId">Tax ID</Field.FieldLabel>
						<Input id="taxId" bind:value={$form.taxId} />
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
								<Select.Item value="PKR">PKR</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="paymentTerms">Payment Terms (days)</Field.FieldLabel>
						<Input
							id="paymentTerms"
							type="number"
							value={$form.paymentTerms ?? ''}
							oninput={(e) => ($form.paymentTerms = e.currentTarget.value || undefined)}
						/>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel for="address">Address</Field.FieldLabel>
					<Input id="address" bind:value={$form.address} />
				</Field.Field>

				<div class="grid gap-4 md:grid-cols-3">
					<Field.Field>
						<Field.FieldLabel for="city">City</Field.FieldLabel>
						<Input id="city" bind:value={$form.city} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="state">State</Field.FieldLabel>
						<Input id="state" bind:value={$form.state} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="postalCode">Postal Code</Field.FieldLabel>
						<Input id="postalCode" bind:value={$form.postalCode} />
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel for="country">Country</Field.FieldLabel>
					<Input id="country" bind:value={$form.country} />
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
					<Textarea id="notes" bind:value={$form.notes} rows={3} />
				</Field.Field>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/ap/vendors">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Vendor'}
					</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
