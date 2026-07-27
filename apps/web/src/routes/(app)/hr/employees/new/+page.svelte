<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const inputClass = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/hr/employees');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Employee</h1>
		<p class="text-muted-foreground">Create a new employee record</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-card-foreground">Personal Information</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="firstName">First Name *</Label>
					<input id="firstName" type="text" value={$form.firstName} oninput={(e) => $form.firstName = e.currentTarget.value} class={inputClass} />
					{#if $errors.firstName}<p class="text-sm text-destructive">{$errors.firstName}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="lastName">Last Name *</Label>
					<input id="lastName" type="text" value={$form.lastName} oninput={(e) => $form.lastName = e.currentTarget.value} class={inputClass} />
					{#if $errors.lastName}<p class="text-sm text-destructive">{$errors.lastName}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="email">Email *</Label>
					<input id="email" type="email" value={$form.email} oninput={(e) => $form.email = e.currentTarget.value} class={inputClass} />
					{#if $errors.email}<p class="text-sm text-destructive">{$errors.email}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="phone">Phone</Label>
					<input id="phone" type="tel" value={$form.phone ?? ''} oninput={(e) => $form.phone = e.currentTarget.value} class={inputClass} />
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-card-foreground">Employment Details</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="departmentId">Department</Label>
					<select id="departmentId" bind:value={$form.departmentId} class={inputClass}>
						<option value="">Select department</option>
						{#each data.departments as dept}
							<option value={dept.id}>{dept.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1.5">
					<Label for="designationId">Designation</Label>
					<select id="designationId" bind:value={$form.designationId} class={inputClass}>
						<option value="">Select designation</option>
						{#each data.designations as desig}
							<option value={desig.id}>{desig.title}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1.5">
					<Label for="employmentType">Employment Type</Label>
					<select id="employmentType" bind:value={$form.employmentType} class={inputClass}>
						<option value="full_time">Full Time</option>
						<option value="part_time">Part Time</option>
						<option value="contract">Contract</option>
						<option value="intern">Intern</option>
					</select>
				</div>
				<div class="space-y-1.5">
					<Label for="dateOfJoining">Joining Date *</Label>
					<input id="dateOfJoining" type="date" value={$form.dateOfJoining} oninput={(e) => $form.dateOfJoining = e.currentTarget.value} class={inputClass} />
					{#if $errors.dateOfJoining}<p class="text-sm text-destructive">{$errors.dateOfJoining}</p>{/if}
				</div>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3">
			<a href="/hr/employees" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</a>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Add Employee
			</Button>
		</div>
	</form>
</div>
