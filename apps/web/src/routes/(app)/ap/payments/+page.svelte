<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'vendorName',
    header: 'Vendor',
    cell: ({ row }) => `<span class="font-medium">${(row as any).original.vendorName || '—'}</span>`,
  },
  {
    accessorKey: 'billNumber',
    header: 'Bill',
    cell: ({ row }) => (row as any).original.billNumber
      ? `<a href="/ap/bills/${(row as any).original.billId}" class="text-primary hover:underline">${(row as any).original.billNumber}</a>`
      : `<span>—</span>`,
  },
  {
    accessorKey: 'paymentDate',
    header: 'Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.paymentDate)}</span>`,
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ row }) => `<span class="text-muted-foreground capitalize">${(row as any).original.paymentMethod.replace('_', ' ')}</span>`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.amount)}</span>`,
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.reference || '—'}</span>`,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => `<span class="text-sm text-muted-foreground">${formatDate((row as any).original.createdAt)}</span>`,
  },
];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Payments</h1>
      <p class="text-muted-foreground">Vendor payment history</p>
    </div>
    <Button href="/ap/payments/new">
      Record Payment
    </Button>
  </div>

  <AppDataTable
    {columns}
    data={data.payments}
    emptyMessage="No payments found."
    onRowClick={(row) => goto(`/ap/payments/${row.id}`)}
  />
</div>
