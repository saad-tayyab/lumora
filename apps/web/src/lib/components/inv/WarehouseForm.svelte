<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';

let {
  warehouse,
  errors = {},
}: {
  warehouse?: {
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    country: string | null;
    status?: 'active' | 'inactive';
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(warehouse?.name ?? '');
let code = $state(warehouse?.code ?? '');
let address = $state(warehouse?.address ?? '');
let city = $state(warehouse?.city ?? '');
let country = $state(warehouse?.country ?? '');
let isActive = $state(warehouse?.status !== 'inactive');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST">
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="name">Name *</Field.FieldLabel>
					<Input id="name" name="name" type="text" required bind:value={name} placeholder="Warehouse name" />
					{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="code">Code *</Field.FieldLabel>
					<Input id="code" name="code" type="text" required maxlength="20" bind:value={code} placeholder="WH-01" />
					{#if errors.code}<p class="mt-1 text-xs text-destructive">{errors.code[0]}</p>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="address">Address</Field.FieldLabel>
				<Input id="address" name="address" type="text" bind:value={address} />
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="city">City</Field.FieldLabel>
					<Input id="city" name="city" type="text" bind:value={city} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="country">Country</Field.FieldLabel>
					<Input id="country" name="country" type="text" maxlength="3" bind:value={country} placeholder="USA" />
				</Field.Field>
			</div>

			<Field.Field class="flex flex-row items-center gap-2">
				<Checkbox id="isActive" bind:checked={isActive} />
				<Field.FieldLabel for="isActive">Active</Field.FieldLabel>
			</Field.Field>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}Saving...{:else}{warehouse ? 'Update Warehouse' : 'Create Warehouse'}{/if}
				</Button>
				<Button href="/inv/warehouses" variant="outline">Cancel</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
