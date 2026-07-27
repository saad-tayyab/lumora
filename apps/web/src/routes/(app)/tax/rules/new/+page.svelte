<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/tax/rules');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Auto-Assignment Rule</h1>
		<p class="text-muted-foreground">Automatically assign tax codes based on entity attributes</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="name">Name *</Field.FieldLabel>
					<Input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} maxlength="100" />
					{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="priority">Priority</Field.FieldLabel>
					<Input id="priority" type="number" value={$form.priority} oninput={(e) => $form.priority = Number(e.currentTarget.value)} />
				</Field.Field>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="taxCodeId">Tax Code *</Field.FieldLabel>
					<Select.Root bind:value={$form.taxCodeId}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select tax code" />
						</Select.Trigger>
						<Select.Content>
							{#each data.codes as code}
								<Select.Item value={code.id}>{code.name} ({code.code})</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if $errors.taxCodeId}<Field.FieldError>{$errors.taxCodeId}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="entityType">Entity Type *</Field.FieldLabel>
					<Input id="entityType" type="text" value={$form.entityType} oninput={(e) => $form.entityType = e.currentTarget.value} maxlength="50" placeholder="e.g. invoice, bill" />
					{#if $errors.entityType}<Field.FieldError>{$errors.entityType}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} />
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="regionCode">Region Code</Field.FieldLabel>
				<Input id="regionCode" type="text" value={$form.regionCode ?? ''} oninput={(e) => $form.regionCode = e.currentTarget.value} maxlength="10" />
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/tax/rules">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Rule
			</Button>
		</div>
	</form>
</div>
