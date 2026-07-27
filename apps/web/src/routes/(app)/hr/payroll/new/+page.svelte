<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
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
			goto('/hr/payroll');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/payroll" class="hover:underline">Payroll</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Payroll Run</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="period">Period *</Label>
						<Input id="period" type="month" bind:value={$form.period} />
						{#if $errors.period}<p class="text-xs text-destructive">{$errors.period}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<select
							id="status"
							bind:value={$form.status}
							class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						>
							<option value="draft">Draft</option>
							<option value="processed">Processed</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/hr/payroll">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Payroll'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
