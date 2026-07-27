<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Department, hrApi } from '$lib/api/hr';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';

let { data }: { data: PageData } = $props();
let departments = $state<Department[]>(data.departments);
let name = $state('');
let code = $state('');
let description = $state('');
let submitting = $state(false);

async function handleCreate(e: Event) {
  e.preventDefault();
  if (!name || !code) {
    toast.error('Name and code are required');
    return;
  }
  submitting = true;
  try {
    const dept = await hrApi.departments.create({ name, code, description: description || null });
    departments = [...departments, dept];
    name = '';
    code = '';
    description = '';
    toast.success('Department created');
  } catch {
    toast.error('Failed to create department');
  } finally {
    submitting = false;
  }
}

async function deleteDept(id: string) {
  if (!confirm('Delete this department?')) return;
  try {
    await hrApi.departments.delete(id);
    departments = departments.filter((d) => d.id !== id);
    toast.success('Department deleted');
  } catch {
    toast.error('Failed to delete');
  }
}
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Departments</h1><p class="text-muted-foreground">Manage organizational departments</p></div>

  <form onsubmit={handleCreate} class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Add Department</h2>
    <div class="grid gap-4 md:grid-cols-3">
      <div><label for="name" class="mb-1 block text-sm font-medium">Name *</label><Input id="name" type="text" bind:value={name} required /></div>
      <div><label for="code" class="mb-1 block text-sm font-medium">Code *</label><Input id="code" type="text" bind:value={code} required /></div>
      <div><label for="desc" class="mb-1 block text-sm font-medium">Description</label><Input id="desc" type="text" bind:value={description} /></div>
    </div>
    <button type="submit" disabled={submitting} class="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
      {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}Add
    </button>
  </form>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if departments.length === 0}<div class="py-12 text-center text-muted-foreground">No departments</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each departments as dept}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 font-medium">{dept.name}</td><td class="px-4 py-3 text-sm">{dept.code}</td><td class="px-4 py-3 text-sm text-muted-foreground">{dept.description || '-'}</td><td class="px-4 py-3 text-right"><button onclick={() => deleteDept(dept.id)} class="text-sm text-destructive hover:underline">Delete</button></td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
