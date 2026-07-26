// @ts-nocheck
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const cnRes = await fetch(`${BASE_URL}/ar/credit-notes/${params.id}`, {
      credentials: 'include',
    });
    if (cnRes.status === 404)
      throw error(404, { code: 'NOT_FOUND', message: 'Credit note not found' });
    if (!cnRes.ok) throw new Error('Failed to fetch credit note');
    const creditNote = await cnRes.json();

    const custRes = await fetch(`${BASE_URL}/ar/customers/${creditNote.customerId}`, {
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
