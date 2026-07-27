<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi, type ReceivingReport } from '$lib/api/proc';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { badgeVariants } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let reports = $state<ReceivingReport[]>(data.reports);
let total = $state(data.total);
let statusFilter = $state('');
let isLoading = $state(false);

function rrStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'confirmed': return 'secondary';
    case 'draft': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  isLoading = true;
  try {
    const result = await procApi.receivingReports.list({
      status: statusFilter || undefined,
      limit: 20,
    });
    reports = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter receiving reports');
  } finally {
    isLoading = false;
  }
}

async function deleteReport(id: string) {
  if (!confirm('Are you sure you want to delete this receiving report?')) return;
  try {
    await procApi.receivingReports.delete(id);
    reports = reports.filter((r) => r.id !== id);
    total--;
    toast.success('Receiving report deleted');
  } catch {
    toast.error('Failed to delete receiving report');
  }
}

$effect(() => {
  statusFilter;
  filterByStatus();
});

const columns: ColumnDef<ReceivingReport>[] = [
  { accessorKey: 'reportNumber', header: 'Report #', cell: (row) => `<a href="/proc/receiving-reports/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.reportNumber}</a>` },
  { accessorKey: 'purchaseOrderNumber', header: 'PO Number', cell: (row) => `<span class="text-sm">${(row as any).original.purchaseOrderNumber}</span>` },
  { accessorKey: 'vendorName', header: 'Vendor', cell: (row) => `<span class="text-sm">${(row as any).original.vendorName}</span>` },
  { accessorKey: 'receivedDate', header: 'Received Date', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.receivedDate)}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="${badgeVariants({ variant: rrStatusVariant((row as any).original.status) })}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => {
      let html = `<div class="flex items-center justify-end gap-2"><a href="/proc/receiving-reports/${(row as any).original.id}" class="text-sm text-primary hover:underline">View</a>`;
      if ((row as any).original.status === 'draft') {
        html += `<button onclick="window.dispatchEvent(new CustomEvent('delete-rr', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`;
      }
      html += '</div>';
      return html;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => deleteReport((e as CustomEvent).detail);
  window.addEventListener('delete-rr', handler);
  return () => window.removeEventListener('delete-rr', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Receiving Reports</h1>
      <p class="text-muted-foreground">Track incoming shipments and receiving</p>
    </div>
    <a
      href="/proc/receiving-reports/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Receiving Report
    </a>
  </div>

  <div class="flex items-center gap-4">
    <Select.Root bind:value={statusFilter}>
      <Select.Trigger class="w-full">
        <Select.Value placeholder="All Statuses" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="">All Statuses</Select.Item>
        <Select.Item value="draft">Draft</Select.Item>
        <Select.Item value="confirmed">Confirmed</Select.Item>
        <Select.Item value="rejected">Rejected</Select.Item>
      </Select.Content>
    </Select.Root>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <AppDataTable
    {columns}
    data={reports}
    loading={isLoading}
    emptyMessage="No receiving reports found"
    pageSize={20}
    totalItems={total}
    onRowClick={(row) => goto(`/proc/receiving-reports/${row.id}`)}
  />
</div>
