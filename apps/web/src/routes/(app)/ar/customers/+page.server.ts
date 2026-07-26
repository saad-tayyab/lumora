import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/api';


export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const res = await fetch(`${BACKEND_URL}/ar/customers?limit=${limit}&offset=${offset}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return { customers: data.data, total: data.total, limit, offset };
  } catch (e) {
    throw error(500, {
      code: 'SERVER_ERROR',
      message: e instanceof Error ? e.message : 'Failed to load customers',
    });
  }
};
