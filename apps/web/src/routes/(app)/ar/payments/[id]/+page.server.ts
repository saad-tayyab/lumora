import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const payment = await api.get<Record<string, unknown>>(`/ar/payments/${params.id}`);

    const customer = await api
      .get<Record<string, unknown>>(`/ar/customers/${(payment as { customerId: string }).customerId}`)
      .catch(() => null);

    return { payment, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load payment',
    });
  }
};
