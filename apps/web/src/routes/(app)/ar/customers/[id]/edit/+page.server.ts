import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ params }) => {
  try {
    const res = await fetch(`${BACKEND_URL}/ar/customers/${params.id}`, {
      credentials: 'include',
    });
    if (res.status === 404) throw new Error('NOT_FOUND');
    if (!res.ok) throw new Error('Failed to fetch customer');
    const customer = await res.json();
    return { customer };
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      throw redirect(303, '/ar/customers');
    }
    throw redirect(303, '/ar/customers');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const addressLine1 = formData.get('addressLine1') as string;
    const addressLine2 = formData.get('addressLine2') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const postalCode = formData.get('postalCode') as string;
    const country = formData.get('country') as string;
    const paymentTerms = formData.get('paymentTerms') as string;
    const creditLimit = formData.get('creditLimit') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!name || name.trim().length === 0) {
      return fail(400, { error: 'Name is required' });
    }

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        paymentTerms: paymentTerms || 'Net 30',
        isActive,
      };
      if (email) body.email = email.trim();
      if (phone) body.phone = phone.trim();
      if (addressLine1) body.addressLine1 = addressLine1.trim();
      if (addressLine2) body.addressLine2 = addressLine2.trim();
      if (city) body.city = city.trim();
      if (state) body.state = state.trim();
      if (postalCode) body.postalCode = postalCode.trim();
      if (country) body.country = country.trim().toUpperCase();
      if (creditLimit) body.creditLimit = creditLimit;

      const res = await fetch(`${BACKEND_URL}/ar/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update customer' }));
        return fail(400, { error: err.message || 'Failed to update customer' });
      }

      return redirect(303, `/ar/customers/${params.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
