import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/api';


export const load: PageServerLoad = async ({ params }) => {
  try {
    const cnRes = await fetch(`${BACKEND_URL}/ar/credit-notes/${params.id}`, {
      credentials: 'include',
    });
    if (cnRes.status === 404)
      throw error(404, { code: 'NOT_FOUND', message: 'Credit note not found' });
    if (!cnRes.ok) throw new Error('Failed to fetch credit note');
    const creditNote = await cnRes.json();

    const custRes = await fetch(`${BACKEND_URL}/ar/customers/${creditNote.customerId}`, {
      credentials: 'include',
    });
    const customer = custRes.ok ? await custRes.json() : null;

    return { creditNote, customer };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load credit note',
    });
  }
};
