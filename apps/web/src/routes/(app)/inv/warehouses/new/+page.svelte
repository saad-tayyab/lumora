<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Card from '$lib/components/ui/card';
import * as Field from '$lib/components/ui/field';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/inv/warehouses');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/inv/warehouses" class="hover:underline">Warehouses</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Add Warehouse</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="name">Name *</Field.FieldLabel>
							<Input id="name" bind:value={$form.name} />
							{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="code">Code *</Field.FieldLabel>
							<Input id="code" bind:value={$form.code} />
							{#if $errors.code}<p class="text-xs text-destructive">{$errors.code}</p>{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="address">Address</Field.FieldLabel>
						<Input id="address" bind:value={$form.address} />
					</Field.Field>

					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="city">City</Field.FieldLabel>
							<Input id="city" bind:value={$form.city} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="country">Country</Field.FieldLabel>
							<Input id="country" bind:value={$form.country} />
						</Field.Field>
					</div>

					<div class="flex justify-end gap-3">
						<Button href="/inv/warehouses" variant="outline">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Warehouse'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
