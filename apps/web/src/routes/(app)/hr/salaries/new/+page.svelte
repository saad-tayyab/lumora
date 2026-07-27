<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/hr/salaries');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/salaries" class="hover:underline">Salaries</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Salary Record</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="employeeId">Employee *</Label>
						<select
							id="employeeId"
							bind:value={$form.employeeId}
							class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						>
							<option value="">Select employee</option>
							{#each data.employees as emp}
								<option value={emp.id}>{emp.firstName} {emp.lastName}</option>
							{/each}
						</select>
						{#if $errors.employeeId}<p class="text-xs text-destructive">{$errors.employeeId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="basicSalary">Basic Salary *</Label>
						<Input id="basicSalary" type="number" step="0.01" min="0" bind:value={$form.basicSalary} />
						{#if $errors.basicSalary}<p class="text-xs text-destructive">{$errors.basicSalary}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="allowances">Allowances</Label>
						<Input id="allowances" type="number" step="0.01" min="0" bind:value={$form.allowances} />
					</div>
					<div class="space-y-2">
						<Label for="deductions">Deductions</Label>
						<Input id="deductions" type="number" step="0.01" min="0" bind:value={$form.deductions} />
					</div>
					<div class="space-y-2">
						<Label for="effectiveFrom">Effective From *</Label>
						<DatePicker bind:value={$form.effectiveFrom} />
						{#if $errors.effectiveFrom}<p class="text-xs text-destructive">{$errors.effectiveFrom}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="effectiveTo">Effective To</Label>
						<DatePicker bind:value={$form.effectiveTo} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<input id="isActive" type="checkbox" bind:checked={$form.isActive} class="h-4 w-4 rounded border" />
					<Label for="isActive">Active</Label>
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/hr/salaries">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Salary Record'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
