import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load: PageServerLoad = async ({ url }) => {
  const customerId = url.searchParams.get('customerId') || undefined;

  try {
    const res = await fetch(`${BASE_URL}/ar/customers?limit=100`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return { customers: data.data, preselectedCustomerId: customerId };
  } catch {
    return { customers: [], preselectedCustomerId: customerId };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
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

      const res = await fetch(`${BASE_URL}/ar/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to record payment' }));
        return fail(400, { error: err.message || 'Failed to record payment' });
      }

      return redirect(303, '/ar/payments');
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
