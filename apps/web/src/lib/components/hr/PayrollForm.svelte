<script lang="ts">
let {
  payroll,
  employees,
  errors = {},
}: {
  payroll?: {
    employeeId: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    basicSalary: string;
    allowances: string;
    deductions: string;
    notes: string | null;
  };
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  errors?: Record<string, string[]>;
} = $props();

let employeeId = $state(payroll?.employeeId ?? '');
let payPeriodStart = $state(payroll?.payPeriodStart ?? '');
let payPeriodEnd = $state(payroll?.payPeriodEnd ?? '');
let basicSalary = $state(payroll?.basicSalary ?? '0');
let allowances = $state(payroll?.allowances ?? '0');
let deductions = $state(payroll?.deductions ?? '0');
let notes = $state(payroll?.notes ?? '');

const netPay = $derived(
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
			<div></div>
			<div>
				<label for="payPeriodStart" class="block text-sm font-medium text-card-foreground">Period Start *</label>
				<input id="payPeriodStart" name="payPeriodStart" type="date" required bind:value={payPeriodStart} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="payPeriodEnd" class="block text-sm font-medium text-card-foreground">Period End *</label>
				<input id="payPeriodEnd" name="payPeriodEnd" type="date" required bind:value={payPeriodEnd} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="basicSalary" class="block text-sm font-medium text-card-foreground">Basic Salary</label>
				<input id="basicSalary" name="basicSalary" type="number" step="0.01" min="0" bind:value={basicSalary} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
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
				<label class="block text-sm font-medium text-card-foreground">Net Pay</label>
				<div class="mt-1 block w-full rounded-md border bg-muted px-3 py-2 text-sm font-medium">${netPay.toFixed(2)}</div>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="2" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Processing...{:else}Process Payroll{/if}
			</button>
			<a href="/hr/payroll" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
