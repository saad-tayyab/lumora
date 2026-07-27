<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
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

<div class="mx-auto max-w-2xl space-y-6">
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
			<Card>
				<CardContent class="space-y-4">
					<div class="space-y-1.5">
						<label for="name" class="text-sm font-medium text-foreground">Name *</label>
						<input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-1.5">
							<label for="startDate" class="text-sm font-medium text-foreground">Start Date *</label>
							<DatePicker bind:value={startDate} />
							<input type="hidden" name="startDate" value={startDate} />
						</div>
						<div class="space-y-1.5">
							<label for="endDate" class="text-sm font-medium text-foreground">End Date *</label>
							<DatePicker bind:value={endDate} />
							<input type="hidden" name="endDate" value={endDate} />
						</div>
					</div>

					<div class="flex justify-end gap-3 pt-4">
						<Button href="/financial/fiscal-years/{data.fiscalYear.id}" variant="outline">Cancel</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</form>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Fiscal year not found</div>
	{/if}
</div>
