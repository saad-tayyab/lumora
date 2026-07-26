import { fail, redirect } from '@sveltejs/kit';
import { api, BACKEND_URL } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ params }) => {
  try {
    const [payRes, custRes] = await Promise.all([
      fetch(`${BACKEND_URL}/ar/payments/${params.id}`, { credentials: 'include' }),
      fetch(`${BACKEND_URL}/ar/customers?limit=100`, { credentials: 'include' }),
    ]);
    if (payRes.status === 404) throw new Error('NOT_FOUND');
    if (!payRes.ok) throw new Error('Failed to fetch payment');
    const payment = await payRes.json();
    const custData = custRes.ok ? await custRes.json() : { data: [] };
    return { payment, customers: custData.data };
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      throw redirect(303, '/ar/payments');
    }
    throw redirect(303, '/ar/payments');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    const paymentNumber = formData.get('paymentNumber') as string;
    const paymentDate = formData.get('paymentDate') as string;
    const amount = formData.get('amount') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const referenceNumber = formData.get('referenceNumber') as string;
    const currency = formData.get('currency') as string;
    const notes = formData.get('notes') as string;

    if (!customerId) return fail(400, { error: 'Customer is required' });
    if (!paymentNumber) return fail(400, { error: 'Payment number is required' });
    if (!paymentDate) return fail(400, { error: 'Payment date is required' });
    if (!amount || parseFloat(amount) <= 0) return fail(400, { error: 'Valid amount is required' });
    if (!paymentMethod) return fail(400, { error: 'Payment method is required' });

    try {
      const body: Record<string, unknown> = {
        customerId,
        paymentNumber: paymentNumber.trim(),
        paymentDate,
        amount,
        paymentMethod,
        currency: currency || 'USD',
      };
      if (referenceNumber) body.referenceNumber = referenceNumber.trim();
      if (notes) body.notes = notes.trim();

      const res = await fetch(`${BACKEND_URL}/ar/payments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update payment' }));
        return fail(400, { error: err.message || 'Failed to update payment' });
      }

      return redirect(303, `/ar/payments/${params.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
