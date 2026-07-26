import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/api';


export const load: PageServerLoad = async ({ params }) => {
  try {
    const [invRes, itemsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/ar/invoices/${params.id}`, { credentials: 'include' }),
      fetch(`${BACKEND_URL}/ar/invoices/${params.id}/line-items`, { credentials: 'include' }),
    ]);
    if (invRes.status === 404)
      throw error(404, { code: 'NOT_FOUND', message: 'Invoice not found' });
    if (!invRes.ok) throw new Error('Failed to fetch invoice');
    const invoice = await invRes.json();
    const lineItems = itemsRes.ok ? await itemsRes.json() : [];

    const custRes = await fetch(`${BACKEND_URL}/ar/customers/${invoice.customerId}`, {
      credentials: 'include',
    });
    const customer = custRes.ok ? await custRes.json() : null;

    return { invoice, lineItems, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load invoice',
    });
  }
};
