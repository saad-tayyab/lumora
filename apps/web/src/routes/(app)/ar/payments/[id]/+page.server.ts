import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const payRes = await fetch(`${BASE_URL}/ar/payments/${params.id}`, { credentials: 'include' });
    if (payRes.status === 404)
      throw error(404, { code: 'NOT_FOUND', message: 'Payment not found' });
    if (!payRes.ok) throw new Error('Failed to fetch payment');
    const payment = await payRes.json();

    const custRes = await fetch(`${BASE_URL}/ar/customers/${payment.customerId}`, {
      credentials: 'include',
    });
    const customer = custRes.ok ? await custRes.json() : null;

    return { payment, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load payment',
    });
  }
};
