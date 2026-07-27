<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Department, hrApi } from '$lib/api/hr';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

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

const columns: ColumnDef<Department>[] = [
  { accessorKey: 'name', header: 'Name', cell: (row) => `<span class="font-medium">${(row as any).original.name}</span>` },
  { accessorKey: 'code', header: 'Code', cell: (row) => `<span class="text-sm">${(row as any).original.code}</span>` },
  { accessorKey: 'description', header: 'Description', cell: (row) => `<span class="text-sm text-muted-foreground">${(row as any).original.description || '-'}</span>` },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-dept', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => deleteDept((e as CustomEvent).detail);
  window.addEventListener('delete-dept', handler);
  return () => window.removeEventListener('delete-dept', handler);
});
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

  <AppDataTable
    {columns}
    data={departments}
    emptyMessage="No departments"
    pageSize={20}
  />
</div>
