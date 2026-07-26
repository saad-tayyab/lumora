import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      state: (formData.get('state') as string) || undefined,
      postalCode: (formData.get('postalCode') as string) || undefined,
      country: (formData.get('country') as string) || 'US',
      taxId: (formData.get('taxId') as string) || undefined,
      paymentTerms: Number(formData.get('paymentTerms')) || 30,
      currency: (formData.get('currency') as string) || 'USD',
      notes: (formData.get('notes') as string) || undefined,
    };

    if (!data.name) {
      return fail(400, { error: 'Name is required' });
    }

    try {
      await apApi.vendors.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create vendor';
      return fail(400, { error: message });
    }
  },
};
