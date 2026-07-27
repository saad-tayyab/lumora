<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/hr/attendance');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/attendance" class="hover:underline">Attendance</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Attendance</h1>
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
						<Label for="date">Date *</Label>
						<DatePicker bind:value={$form.date} />
						{#if $errors.date}<p class="text-xs text-destructive">{$errors.date}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="checkIn">Check In</Label>
						<Input id="checkIn" type="time" bind:value={$form.checkIn} />
					</div>
					<div class="space-y-2">
						<Label for="checkOut">Check Out</Label>
						<Input id="checkOut" type="time" bind:value={$form.checkOut} />
					</div>
					<div class="space-y-2">
						<Label for="status">Status *</Label>
						<select
							id="status"
							bind:value={$form.status}
							class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						>
							<option value="present">Present</option>
							<option value="absent">Absent</option>
							<option value="half_day">Half Day</option>
							<option value="late">Late</option>
						</select>
						{#if $errors.status}<p class="text-xs text-destructive">{$errors.status}</p>{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<Textarea id="notes" bind:value={$form.notes} rows={3} />
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/hr/attendance">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Saving...' : 'Record Attendance'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
