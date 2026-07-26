<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { hrApi } from '$lib/api/hr';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let firstName = $state('');
let lastName = $state('');
let email = $state('');
let phone = $state('');
let departmentId = $state('');
let designationId = $state('');
let employmentType = $state<string>('full_time');
let joiningDate = $state(new Date().toISOString().split('T')[0]);
let submitting = $state(false);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!firstName || !lastName || !email || !departmentId || !designationId) {
    toast.error('Please fill in all required fields');
    return;
  }

  submitting = true;
  try {
    const emp = await hrApi.employees.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      departmentId,
      designationId,
      employmentType,
      joiningDate,
    });
    toast.success('Employee created');
    goto(`/hr/employees/${emp.id}`);
  } catch {
    toast.error('Failed to create employee');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Add Employee</h1>
    <p class="text-muted-foreground">Create a new employee record</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Personal Information</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="firstName" class="mb-1 block text-sm font-medium text-card-foreground">First Name *</label>
          <input id="firstName" type="text" bind:value={firstName} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required />
        </div>
        <div>
          <label for="lastName" class="mb-1 block text-sm font-medium text-card-foreground">Last Name *</label>
          <input id="lastName" type="text" bind:value={lastName} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required />
        </div>
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-card-foreground">Email *</label>
          <input id="email" type="email" bind:value={email} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required />
        </div>
        <div>
          <label for="phone" class="mb-1 block text-sm font-medium text-card-foreground">Phone</label>
          <input id="phone" type="tel" bind:value={phone} class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Employment Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="departmentId" class="mb-1 block text-sm font-medium text-card-foreground">Department *</label>
          <select id="departmentId" bind:value={departmentId} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
            <option value="">Select department</option>
            {#each data.departments as dept}
              <option value={dept.id}>{dept.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="designationId" class="mb-1 block text-sm font-medium text-card-foreground">Designation *</label>
          <select id="designationId" bind:value={designationId} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
            <option value="">Select designation</option>
            {#each data.designations as desig}
              <option value={desig.id}>{desig.title}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="employmentType" class="mb-1 block text-sm font-medium text-card-foreground">Employment Type</label>
          <select id="employmentType" bind:value={employmentType} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <label for="joiningDate" class="mb-1 block text-sm font-medium text-card-foreground">Joining Date *</label>
          <input id="joiningDate" type="date" bind:value={joiningDate} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <a href="/hr/employees" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
        Add Employee
      </button>
    </div>
  </form>
</div>
