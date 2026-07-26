// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const vendor = await apApi.vendors.get(params.id);
    return { vendor };
  } catch {
    throw new Response('Vendor not found', { status: 404 });
  }
};

export const actions = {
  default: async ({ request, params }: import('./$types').RequestEvent) => {
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
      await apApi.vendors.update(params.id, data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update vendor';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;