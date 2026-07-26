import type { PageServerLoad } from './$types';
import { api, type PaginatedResponse } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [invoices, bills, employees] = await Promise.allSettled([
      api.get<PaginatedResponse<any>>('/ar/invoices?limit=100'),
      api.get<PaginatedResponse<any>>('/ap/bills?limit=100'),
      api.get<PaginatedResponse<any>>('/hr/employees?limit=100'),
    ]);

    const outstandingInvoices =
      invoices.status === 'fulfilled'
        ? invoices.value.data?.filter(
            (i: { status: string }) => i.status === 'overdue' || i.status === 'sent',
          ) || []
        : [];
    const pendingBills =
      bills.status === 'fulfilled'
        ? bills.value.data?.filter(
            (b: { status: string }) =>
              b.status === 'pending_approval' || b.status === 'draft',
          ) || []
        : [];

    return {
      outstandingInvoicesCount: outstandingInvoices.length,
      outstandingInvoicesTotal: outstandingInvoices.reduce(
        (sum: number, i: { balanceDue: string }) => sum + parseFloat(i.balanceDue || '0'),
        0,
      ),
      pendingBillsCount: pendingBills.length,
      pendingBillsTotal: pendingBills.reduce(
        (sum: number, b: { totalAmount: string }) => sum + parseFloat(b.totalAmount || '0'),
        0,
      ),
      employeeCount:
        employees.status === 'fulfilled' ? employees.value.total || 0 : 0,
    };
  } catch {
    return {
      outstandingInvoicesCount: 0,
      outstandingInvoicesTotal: 0,
      pendingBillsCount: 0,
      pendingBillsTotal: 0,
      employeeCount: 0,
    };
  }
};
