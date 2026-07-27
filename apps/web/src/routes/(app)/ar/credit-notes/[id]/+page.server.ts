import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const creditNote = await api.get<Record<string, unknown>>(
      `/ar/credit-notes/${params.id}`,
    );

    const customer = await api
      .get<Record<string, unknown>>(`/ar/customers/${(creditNote as { customerId: string }).customerId}`)
      .catch(() => null);

    return { creditNote, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load credit note',
    });
  }
};
