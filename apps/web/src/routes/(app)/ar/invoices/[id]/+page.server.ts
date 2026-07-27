import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [invoice, lineItems] = await Promise.all([
      api.get<Record<string, unknown>>(`/ar/invoices/${params.id}`),
      api.get<unknown[]>(`/ar/invoices/${params.id}/line-items`).catch(() => []),
    ]);

    const customer = await api
      .get<Record<string, unknown>>(`/ar/customers/${(invoice as { customerId: string }).customerId}`)
      .catch(() => null);

    return { invoice, lineItems, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load invoice',
    });
  }
};
