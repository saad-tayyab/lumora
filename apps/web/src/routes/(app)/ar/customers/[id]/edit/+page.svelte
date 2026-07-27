<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let customer = $derived(data.customer);
let isLoading = $state(false);
let isActive = $state(customer.isActive);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ar/customers" class="hover:underline">Customers</a>
			<span>/</span>
			<a href="/ar/customers/{customer.id}" class="hover:underline">{customer.name}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Customer</h1>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<form
			method="POST"
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					await update();
				};
			}}
		>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="name">Name *</Field.FieldLabel>
						<Input id="name" name="name" type="text" required value={customer.name} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="email">Email</Field.FieldLabel>
						<Input id="email" name="email" type="email" value={customer.email || ''} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="phone">Phone</Field.FieldLabel>
						<Input id="phone" name="phone" type="text" value={customer.phone || ''} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="paymentTerms">Payment Terms</Field.FieldLabel>
						<Select.Root value={customer.paymentTerms}>
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
							name="creditLimit"
							type="number"
							step="0.01"
							min="0"
							value={customer.creditLimit || ''}
						/>
					</Field.Field>
					<Field.Field class="flex flex-row items-center gap-2">
						<input type="hidden" name="isActive" value={isActive ? 'true' : ''} />
						<Checkbox id="isActive" bind:checked={isActive} />
						<Field.FieldLabel for="isActive">Active</Field.FieldLabel>
					</Field.Field>
				</div>

				<div>
					<h3 class="text-sm font-medium text-card-foreground">Address</h3>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field class="md:col-span-2">
							<Field.FieldLabel for="addressLine1">Address Line 1</Field.FieldLabel>
							<Input id="addressLine1" name="addressLine1" type="text" value={customer.addressLine1 || ''} />
						</Field.Field>
						<Field.Field class="md:col-span-2">
							<Field.FieldLabel for="addressLine2">Address Line 2</Field.FieldLabel>
							<Input id="addressLine2" name="addressLine2" type="text" value={customer.addressLine2 || ''} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="city">City</Field.FieldLabel>
							<Input id="city" name="city" type="text" value={customer.city || ''} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="state">State</Field.FieldLabel>
							<Input id="state" name="state" type="text" value={customer.state || ''} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="postalCode">Postal Code</Field.FieldLabel>
							<Input id="postalCode" name="postalCode" type="text" value={customer.postalCode || ''} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="country">Country (3-letter code)</Field.FieldLabel>
							<Input id="country" name="country" type="text" maxlength="3" value={customer.country || ''} />
						</Field.Field>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<Button type="submit" disabled={isLoading}>
						{#if isLoading}Saving...{:else}Save Changes{/if}
					</Button>
					<Button variant="outline" href="/ar/customers/{customer.id}">Cancel</Button>
				</div>
			</Field.FieldGroup>
		</form>
	</div>
</div>
