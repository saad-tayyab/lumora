<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Designation, hrApi } from '$lib/api/hr';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import * as Select from '$lib/components/ui/select';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

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

const columns: ColumnDef<Designation>[] = [
  { accessorKey: 'title', header: 'Title', cell: (row) => `<span class="font-medium">${(row as any).original.title}</span>` },
  { accessorKey: 'code', header: 'Code', cell: (row) => `<span class="text-sm">${(row as any).original.code}</span>` },
  { accessorKey: 'departmentName', header: 'Department', cell: (row) => `<span class="text-sm">${(row as any).original.departmentName}</span>` },
  { accessorKey: 'level', header: 'Level', cell: (row) => `<span class="text-sm text-right">${(row as any).original.level}</span>` },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-desig', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => deleteDesig((e as CustomEvent).detail);
  window.addEventListener('delete-desig', handler);
  return () => window.removeEventListener('delete-desig', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div><h1 class="text-3xl font-bold text-foreground">Designations</h1><p class="text-muted-foreground">Manage job designations and levels</p></div>

  <form onsubmit={handleCreate} class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Add Designation</h2>
    <div class="grid gap-4 md:grid-cols-4">
      <div><label for="title" class="mb-1 block text-sm font-medium">Title *</label><Input id="title" type="text" bind:value={title} required /></div>
      <div><label for="code" class="mb-1 block text-sm font-medium">Code *</label><Input id="code" type="text" bind:value={code} required /></div>
      <div><label for="deptId" class="mb-1 block text-sm font-medium">Department *</label><Select.Root bind:value={departmentId}><Select.Trigger class="w-full"><Select.Value placeholder="Select" /></Select.Trigger><Select.Content>{#each data.departments as d}<Select.Item value={d.id}>{d.name}</Select.Item>{/each}</Select.Content></Select.Root></div>
      <div><label for="level" class="mb-1 block text-sm font-medium">Level</label><Input id="level" type="number" bind:value={level} min="1" /></div>
    </div>
    <button type="submit" disabled={submitting} class="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
      {#if submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}Add
    </button>
  </form>

  <AppDataTable
    {columns}
    data={designations}
    emptyMessage="No designations"
    pageSize={20}
  />
</div>
