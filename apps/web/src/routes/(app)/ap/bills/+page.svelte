<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let statusFilter = $state(data.statusFilter || '');

function getStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'pending_approval': return 'outline';
    case 'approved': return 'default';
    case 'partially_paid': return 'outline';
    case 'paid': return 'secondary';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    cell: ({ row }) => `<a href="/ap/bills/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.billNumber}</a>`,
  },
  {
    accessorKey: 'vendorName',
    header: 'Vendor',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.vendorName || '—'}</span>`,
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.issueDate)}</span>`,
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.dueDate)}</span>`,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.total)}</span>`,
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid',
    cell: ({ row }) => `<span class="text-right text-muted-foreground">${formatCurrency((row as any).original.amountPaid)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status.replace('_', ' ')}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Bills</h1>
      <p class="text-muted-foreground">Manage vendor bills</p>
    </div>
    <Button href="/ap/bills/new">
      Record Bill
    </Button>
  </div>

  <div class="flex items-center gap-4">
    <Input
      type="text"
      placeholder="Search bills..."
      class="max-w-sm"
    />
    <Select.Root bind:value={statusFilter}>
      <Select.Trigger class="w-full">
        <Select.Value placeholder="All Statuses" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="">All Statuses</Select.Item>
        <Select.Item value="draft">Draft</Select.Item>
        <Select.Item value="pending_approval">Pending Approval</Select.Item>
        <Select.Item value="approved">Approved</Select.Item>
        <Select.Item value="partially_paid">Partially Paid</Select.Item>
        <Select.Item value="paid">Paid</Select.Item>
        <Select.Item value="voided">Voided</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <AppDataTable
    {columns}
    data={data.bills}
    emptyMessage="No bills found."
    onRowClick={(row) => goto(`/ap/bills/${row.id}`)}
  />
</div>
