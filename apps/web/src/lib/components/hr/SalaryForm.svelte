<script lang="ts">
let {
  salary,
  employees,
  errors = {},
}: {
  salary?: {
    employeeId: string;
    basicSalary: string;
    allowances: string;
    deductions: string;
    effectiveDate: string;
  };
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  errors?: Record<string, string[]>;
} = $props();

let employeeId = $state(salary?.employeeId ?? '');
let basicSalary = $state(salary?.basicSalary ?? '0');
let allowances = $state(salary?.allowances ?? '0');
let deductions = $state(salary?.deductions ?? '0');
let effectiveDate = $state(salary?.effectiveDate ?? '');

const netSalary = $derived(
  (parseFloat(basicSalary) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0),
);

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
				<label for="effectiveDate" class="block text-sm font-medium text-card-foreground">Effective Date *</label>
				<input id="effectiveDate" name="effectiveDate" type="date" required bind:value={effectiveDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="basicSalary" class="block text-sm font-medium text-card-foreground">Basic Salary *</label>
				<input id="basicSalary" name="basicSalary" type="number" step="0.01" min="0" required bind:value={basicSalary} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="allowances" class="block text-sm font-medium text-card-foreground">Allowances</label>
				<input id="allowances" name="allowances" type="number" step="0.01" min="0" bind:value={allowances} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="deductions" class="block text-sm font-medium text-card-foreground">Deductions</label>
				<input id="deductions" name="deductions" type="number" step="0.01" min="0" bind:value={deductions} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label class="block text-sm font-medium text-card-foreground">Net Salary</label>
				<div class="mt-1 block w-full rounded-md border bg-muted px-3 py-2 text-sm font-medium">${netSalary.toFixed(2)}</div>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{salary ? 'Update Salary' : 'Set Salary'}{/if}
			</button>
			<a href="/hr/salaries" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
