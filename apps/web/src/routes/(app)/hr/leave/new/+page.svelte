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
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/hr/leave');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/leave" class="hover:underline">Leave Requests</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Leave Request</h1>
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
						<Label for="leaveTypeId">Leave Type *</Label>
						<select
							id="leaveTypeId"
							bind:value={$form.leaveTypeId}
							class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						>
							<option value="">Select leave type</option>
							{#each data.leaveTypes as lt}
								<option value={lt.id}>{lt.name}</option>
							{/each}
						</select>
						{#if $errors.leaveTypeId}<p class="text-xs text-destructive">{$errors.leaveTypeId}</p>{/if}
					</div>
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
					<div class="space-y-2">
						<Label for="totalDays">Total Days *</Label>
						<Input id="totalDays" type="number" min="1" bind:value={$form.totalDays} />
						{#if $errors.totalDays}<p class="text-xs text-destructive">{$errors.totalDays}</p>{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="reason">Reason *</Label>
					<Textarea id="reason" bind:value={$form.reason} rows={3} />
					{#if $errors.reason}<p class="text-xs text-destructive">{$errors.reason}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<Textarea id="notes" bind:value={$form.notes} rows={2} />
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/hr/leave">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Submitting...' : 'Submit Request'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
