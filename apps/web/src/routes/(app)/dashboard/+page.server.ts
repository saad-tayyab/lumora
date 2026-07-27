import type { PageServerLoad } from './$types';
import { BACKEND_URL, type PaginatedResponse } from '$lib/api';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  balanceDue: string;
  totalAmount: string;
  status: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
}

interface Bill {
  id: string;
  billNumber: string;
  totalAmount: string;
  status: string;
  dueDate: string;
  vendorName: string;
}

interface Payment {
  id: string;
  paymentNumber: string;
  amount: string;
  paymentDate: string;
  customerName?: string;
  vendorName?: string;
}

export const load: PageServerLoad = async () => {
  try {
    const [invoicesRes, billsRes, employeesRes, recentInvoicesRes, recentPaymentsRes] =
      await Promise.allSettled([
        fetchJson<PaginatedResponse<Invoice>>('/ar/invoices?limit=200'),
        fetchJson<PaginatedResponse<Bill>>('/ap/bills?limit=200'),
        fetchJson<PaginatedResponse<unknown>>('/hr/employees?limit=1'),
        fetchJson<PaginatedResponse<Invoice>>('/ar/invoices?limit=5&sort=createdAt&order=desc'),
        fetchJson<PaginatedResponse<Payment>>('/ar/payments?limit=5&sort=createdAt&order=desc'),
      ]);

    const invoices =
      invoicesRes.status === 'fulfilled' ? invoicesRes.value.data || [] : [];
    const bills = billsRes.status === 'fulfilled' ? billsRes.value.data || [] : [];

    const outstandingInvoices = invoices.filter(
      (i) => i.status === 'overdue' || i.status === 'sent',
    );
    const pendingBills = bills.filter(
      (b) => b.status === 'pending_approval' || b.status === 'draft',
    );

    return {
      outstandingInvoicesTotal: outstandingInvoices.reduce(
        (sum, i) => sum + parseFloat(i.balanceDue || '0'),
        0,
      ),
      outstandingInvoicesCount: outstandingInvoices.length,
      pendingBillsTotal: pendingBills.reduce(
        (sum, b) => sum + parseFloat(b.totalAmount || '0'),
        0,
      ),
      pendingBillsCount: pendingBills.length,
      employeeCount:
        employeesRes.status === 'fulfilled' ? employeesRes.value.total || 0 : 0,
      recentInvoices:
        recentInvoicesRes.status === 'fulfilled'
          ? (recentInvoicesRes.value.data || []).slice(0, 5)
          : [],
      recentPayments:
        recentPaymentsRes.status === 'fulfilled'
          ? (recentPaymentsRes.value.data || []).slice(0, 5)
          : [],
    };
  } catch {
    return {
      outstandingInvoicesTotal: 0,
      outstandingInvoicesCount: 0,
      pendingBillsTotal: 0,
      pendingBillsCount: 0,
      employeeCount: 0,
      recentInvoices: [],
      recentPayments: [],
    };
  }
};
