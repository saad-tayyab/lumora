<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/financial/fiscal-years');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<a href="/financial/fiscal-years" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Fiscal Years
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Fiscal Year</h1>
		<p class="mt-1 text-muted-foreground">Create a new fiscal year period</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Year Name *</Label>
					<Input id="name" bind:value={$form.name} placeholder="e.g. FY 2026" />
					{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="startDate">Start Date *</Label>
						<DatePicker bind:value={$form.startDate} />
						{#if $errors.startDate}<p class="text-xs text-destructive">{$errors.startDate}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="endDate">End Date *</Label>
						<DatePicker bind:value={$form.endDate} />
						{#if $errors.endDate}<p class="text-xs text-destructive">{$errors.endDate}</p>{/if}
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-2">
					<Button href="/financial/fiscal-years" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Fiscal Year'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
