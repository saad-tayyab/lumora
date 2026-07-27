<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Designation, hrApi } from '$lib/api/hr';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';

let { data }: { data: PageData } = $props();
let designations = $state<Designation[]>(data.designations);
let title = $state('');
let code = $state('');
let departmentId = $state('');
let level = $state(1);
let submitting = $state(false);

async function handleCreate(e: Event) {
  e.preventDefault();
  if (!title || !code || !departmentId) {
    toast.error('Title, code, and department are required');
    return;
  }
  submitting = true;
  try {
    const desig = await hrApi.designations.create({ title, code, departmentId, level });
    designations = [...designations, desig];
    title = '';
    code = '';
    departmentId = '';
    level = 1;
    toast.success('Designation created');
  } catch {
    toast.error('Failed to create designation');
  } finally {
    submitting = false;
  }
}

async function deleteDesig(id: string) {
  if (!confirm('Delete this designation?')) return;
  try {
    await hrApi.designations.delete(id);
    designations = designations.filter((d) => d.id !== id);
    toast.success('Designation deleted');
  } catch {
    toast.error('Failed to delete');
  }
}
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Designations</h1><p class="text-muted-foreground">Manage job designations and levels</p></div>

  <form onsubmit={handleCreate} class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Add Designation</h2>
    <div class="grid gap-4 md:grid-cols-4">
      <div><label for="title" class="mb-1 block text-sm font-medium">Title *</label><Input id="title" type="text" bind:value={title} required /></div>
      <div><label for="code" class="mb-1 block text-sm font-medium">Code *</label><Input id="code" type="text" bind:value={code} required /></div>
      <div><label for="deptId" class="mb-1 block text-sm font-medium">Department *</label><select id="deptId" bind:value={departmentId} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required><option value="">Select</option>{#each data.departments as d}<option value={d.id}>{d.name}</option>{/each}</select></div>
      <div><label for="level" class="mb-1 block text-sm font-medium">Level</label><Input id="level" type="number" bind:value={level} min="1" /></div>
    </div>
    <button type="submit" disabled={submitting} class="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
      {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}Add
    </button>
  </form>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if designations.length === 0}<div class="py-12 text-center text-muted-foreground">No designations</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Level</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each designations as des}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 font-medium">{des.title}</td><td class="px-4 py-3 text-sm">{des.code}</td><td class="px-4 py-3 text-sm">{des.departmentName}</td><td class="px-4 py-3 text-right text-sm">{des.level}</td><td class="px-4 py-3 text-right"><button onclick={() => deleteDesig(des.id)} class="text-sm text-destructive hover:underline">Delete</button></td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
