<script lang="ts">
let {
  leaveRequest,
  employees,
  errors = {},
}: {
  leaveRequest?: {
    employeeId: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string | null;
  };
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  errors?: Record<string, string[]>;
} = $props();

let employeeId = $state(leaveRequest?.employeeId ?? '');
let startDate = $state(leaveRequest?.startDate ?? '');
let endDate = $state(leaveRequest?.endDate ?? '');
let leaveType = $state(leaveRequest?.leaveType ?? 'annual');
let reason = $state(leaveRequest?.reason ?? '');

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
				<label for="leaveType" class="block text-sm font-medium text-card-foreground">Leave Type *</label>
				<select id="leaveType" name="leaveType" bind:value={leaveType} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="annual">Annual</option>
					<option value="sick">Sick</option>
					<option value="personal">Personal</option>
					<option value="maternity">Maternity</option>
					<option value="paternity">Paternity</option>
					<option value="unpaid">Unpaid</option>
				</select>
			</div>
			<div>
				<label for="startDate" class="block text-sm font-medium text-card-foreground">Start Date *</label>
				<input id="startDate" name="startDate" type="date" required bind:value={startDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-card-foreground">End Date *</label>
				<input id="endDate" name="endDate" type="date" required bind:value={endDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="reason" class="block text-sm font-medium text-card-foreground">Reason</label>
			<textarea id="reason" name="reason" rows="3" bind:value={reason} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Submitting...{:else}Submit Request{/if}
			</button>
			<a href="/hr/leave-requests" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
