import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const customer = await api.get<Record<string, unknown>>(`/ar/customers/${params.id}`);

    const invoices = await api
      .get<{ data: unknown[]; total: number }>(
        `/ar/invoices?customerId=${params.id}&limit=50`,
      )
      .catch(() => ({ data: [], total: 0 }));

    const allPayments = await api
      .get<{ data: { customerId: string }[] }>(`/ar/payments?limit=50`)
      .catch(() => ({ data: [] }));

    const customerPayments = allPayments.data.filter((p) => p.customerId === params.id);

    return {
      customer,
      invoices: invoices.data,
      totalInvoices: invoices.total,
      payments: customerPayments,
    };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load customer',
    });
  }
};
