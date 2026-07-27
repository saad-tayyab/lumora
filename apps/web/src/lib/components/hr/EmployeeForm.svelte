<script lang="ts">
import * as Select from '$lib/components/ui/select';
let {
  employee,
  departments,
  designations,
  errors = {},
}: {
  employee?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    departmentId: string;
    designationId: string;
    joiningDate: string;
    employmentType: string;
    status: string;
  };
  departments: Array<{ id: string; name: string }>;
  designations: Array<{ id: string; title: string }>;
  errors?: Record<string, string[]>;
} = $props();

let firstName = $state(employee?.firstName ?? '');
let lastName = $state(employee?.lastName ?? '');
let email = $state(employee?.email ?? '');
let phone = $state(employee?.phone ?? '');
let departmentId = $state(employee?.departmentId ?? '');
let designationId = $state(employee?.designationId ?? '');
let joiningDate = $state(employee?.joiningDate ?? '');
let employmentType = $state(employee?.employmentType ?? 'full_time');
let status = $state(employee?.status ?? 'active');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="flex flex-col gap-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="firstName" class="block text-sm font-medium text-card-foreground">First Name *</label>
				<input id="firstName" name="firstName" type="text" required bind:value={firstName} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="lastName" class="block text-sm font-medium text-card-foreground">Last Name *</label>
				<input id="lastName" name="lastName" type="text" required bind:value={lastName} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-card-foreground">Email *</label>
				<input id="email" name="email" type="email" required bind:value={email} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="phone" class="block text-sm font-medium text-card-foreground">Phone</label>
				<input id="phone" name="phone" type="text" bind:value={phone} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="departmentId" class="block text-sm font-medium text-card-foreground">Department *</label>
			<Select.Root bind:value={departmentId}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select department" />
				</Select.Trigger>
				<Select.Content>
					{#each departments as dept}
						<Select.Item value={dept.id}>{dept.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			</div>
			<div>
				<label for="designationId" class="block text-sm font-medium text-card-foreground">Designation *</label>
			<Select.Root bind:value={designationId}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select designation" />
				</Select.Trigger>
				<Select.Content>
					{#each designations as des}
						<Select.Item value={des.id}>{des.title}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			</div>
			<div>
				<label for="joiningDate" class="block text-sm font-medium text-card-foreground">Joining Date *</label>
				<input id="joiningDate" name="joiningDate" type="date" required bind:value={joiningDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="employmentType" class="block text-sm font-medium text-card-foreground">Employment Type</label>
			<Select.Root bind:value={employmentType}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select type" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="full_time">Full Time</Select.Item>
					<Select.Item value="part_time">Part Time</Select.Item>
					<Select.Item value="contract">Contract</Select.Item>
					<Select.Item value="intern">Intern</Select.Item>
				</Select.Content>
			</Select.Root>
			</div>
		</div>

		<div>
			<label for="status" class="block text-sm font-medium text-card-foreground">Status</label>
		<Select.Root bind:value={status}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select status" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="active">Active</Select.Item>
				<Select.Item value="inactive">Inactive</Select.Item>
				<Select.Item value="terminated">Terminated</Select.Item>
			</Select.Content>
		</Select.Root>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{employee ? 'Update Employee' : 'Create Employee'}{/if}
			</button>
			<a href="/hr/employees" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
