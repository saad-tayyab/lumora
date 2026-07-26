import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const res = await fetch(`${BASE_URL}/ar/customers/${params.id}`, {
      credentials: 'include',
    });
    if (res.status === 404) throw error(404, { code: 'NOT_FOUND', message: 'Customer not found' });
    if (!res.ok) throw new Error('Failed to fetch customer');
    const customer = await res.json();

    const invRes = await fetch(`${BASE_URL}/ar/invoices?customerId=${params.id}&limit=50`, {
      credentials: 'include',
    });
    const invoices = invRes.ok ? await invRes.json() : { data: [], total: 0 };

    const payRes = await fetch(`${BASE_URL}/ar/payments?limit=50`, { credentials: 'include' });
    const allPayments = payRes.ok ? await payRes.json() : { data: [] };
    const customerPayments = allPayments.data.filter(
      (p: { customerId: string }) => p.customerId === params.id,
    );

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
