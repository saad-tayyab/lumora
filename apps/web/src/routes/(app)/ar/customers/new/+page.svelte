<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Customer</h1>
		<p class="text-muted-foreground">Add a new customer account</p>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="name">Name *</Field.FieldLabel>
						<Input id="name" bind:value={$form.name} placeholder="Customer name" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="email">Email</Field.FieldLabel>
						<Input id="email" type="email" bind:value={$form.email} placeholder="customer@example.com" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="phone">Phone</Field.FieldLabel>
						<Input id="phone" bind:value={$form.phone} placeholder="+1 (555) 000-0000" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="paymentTerms">Payment Terms</Field.FieldLabel>
						<Select.Root bind:value={$form.paymentTerms}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select terms" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="Net 15">Net 15</Select.Item>
								<Select.Item value="Net 30">Net 30</Select.Item>
								<Select.Item value="Net 45">Net 45</Select.Item>
								<Select.Item value="Net 60">Net 60</Select.Item>
								<Select.Item value="Due on Receipt">Due on Receipt</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="creditLimit">Credit Limit</Field.FieldLabel>
						<Input
							id="creditLimit"
							type="number"
							step="0.01"
							min="0"
							value={$form.creditLimit ?? ''}
							oninput={(e) => ($form.creditLimit = Number(e.currentTarget.value) || undefined)}
							placeholder="0.00"
						/>
					</Field.Field>
				</div>

				<div>
					<h3 class="text-sm font-medium text-card-foreground">Address</h3>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field class="md:col-span-2">
							<Field.FieldLabel for="addressLine1">Address Line 1</Field.FieldLabel>
							<Input id="addressLine1" bind:value={$form.addressLine1} placeholder="Street address" />
						</Field.Field>
						<Field.Field class="md:col-span-2">
							<Field.FieldLabel for="addressLine2">Address Line 2</Field.FieldLabel>
							<Input id="addressLine2" bind:value={$form.addressLine2} placeholder="Suite, unit, etc." />
						</Field.Field>
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
						<Field.Field>
							<Field.FieldLabel for="country">Country (3-letter code)</Field.FieldLabel>
							<Input id="country" bind:value={$form.country} maxlength={3} placeholder="USA" />
						</Field.Field>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Customer'}
					</Button>
					<Button variant="outline" href="/ar/customers">Cancel</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
