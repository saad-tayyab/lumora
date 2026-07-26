<script lang="ts">
let {
  attendance,
  employees,
  errors = {},
}: {
  attendance?: {
    employeeId: string;
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    notes: string | null;
  };
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  errors?: Record<string, string[]>;
} = $props();

let employeeId = $state(attendance?.employeeId ?? '');
let date = $state(attendance?.date ?? new Date().toISOString().split('T')[0]);
let status = $state(attendance?.status ?? 'present');
let checkIn = $state(attendance?.checkIn ?? '');
let checkOut = $state(attendance?.checkOut ?? '');
let notes = $state(attendance?.notes ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="employeeId" class="block text-sm font-medium text-card-foreground">Employee *</label>
				<select id="employeeId" name="employeeId" required bind:value={employeeId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select employee</option>
					{#each employees as emp}
						<option value={emp.id}>{emp.firstName} {emp.lastName}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="date" class="block text-sm font-medium text-card-foreground">Date *</label>
				<input id="date" name="date" type="date" required bind:value={date} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-card-foreground">Status *</label>
				<select id="status" name="status" bind:value={status} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="present">Present</option>
					<option value="absent">Absent</option>
					<option value="late">Late</option>
					<option value="half_day">Half Day</option>
					<option value="on_leave">On Leave</option>
				</select>
			</div>
			<div>
				<label for="checkIn" class="block text-sm font-medium text-card-foreground">Check In</label>
				<input id="checkIn" name="checkIn" type="time" bind:value={checkIn} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="checkOut" class="block text-sm font-medium text-card-foreground">Check Out</label>
				<input id="checkOut" name="checkOut" type="time" bind:value={checkOut} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="2" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{attendance ? 'Update' : 'Record'} Attendance{/if}
			</button>
			<a href="/hr/attendance" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
