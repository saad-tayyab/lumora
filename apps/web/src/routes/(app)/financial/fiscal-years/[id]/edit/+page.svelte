<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Card from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import type { PageData, ActionData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let submitting = $state(false);

let name = $state(data.fiscalYear?.name || '');
let startDate = $state(data.fiscalYear?.startDate?.split('T')[0] || '');
let endDate = $state(data.fiscalYear?.endDate?.split('T')[0] || '');

$effect(() => {
	if (form?.error) {
		toast.error(form.error);
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/financial/fiscal-years" class="hover:underline">Fiscal Years</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Fiscal Year</h1>
	</div>

	{#if data.fiscalYear}
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<Card.Root>
				<Card.Content>
					<Field.FieldGroup>
						<Field.Field>
							<Field.FieldLabel for="name">Name *</Field.FieldLabel>
							<Input id="name" name="name" bind:value={name} required />
						</Field.Field>
						<div class="grid gap-4 md:grid-cols-2">
							<Field.Field>
								<Field.FieldLabel for="startDate">Start Date *</Field.FieldLabel>
								<DatePicker bind:value={startDate} />
								<input type="hidden" name="startDate" value={startDate} />
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel for="endDate">End Date *</Field.FieldLabel>
								<DatePicker bind:value={endDate} />
								<input type="hidden" name="endDate" value={endDate} />
							</Field.Field>
						</div>
					</Field.FieldGroup>

					<div class="flex justify-end gap-3 pt-4">
						<Button href="/financial/fiscal-years/{data.fiscalYear.id}" variant="outline">Cancel</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</form>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Fiscal year not found</div>
	{/if}
</div>
